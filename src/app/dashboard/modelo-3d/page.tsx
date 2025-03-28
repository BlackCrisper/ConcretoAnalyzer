"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FiUpload, FiFile, FiRefreshCw, FiChevronDown, FiX, FiPlus } from "react-icons/fi";
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { useAuth } from '@/contexts/auth-context';

// Mock projects data
const mockProjects = [
  { id: "1", name: "Edifício Comercial Central", type: "Comercial", location: "São Paulo - SP", lastUpdated: "2023-07-25" },
  { id: "2", name: "Ponte Estaiada Rio Grande", type: "Infraestrutura", location: "Porto Alegre - RS", lastUpdated: "2023-07-15" },
  { id: "3", name: "Condomínio Residencial Parque das Flores", type: "Residencial", location: "Belo Horizonte - MG", lastUpdated: "2023-07-10" },
  { id: "4", name: "Viaduto da Avenida Norte", type: "Infraestrutura", location: "Recife - PE", lastUpdated: "2023-07-05" },
  { id: "5", name: "Centro Empresarial Skyline", type: "Comercial", location: "Rio de Janeiro - RJ", lastUpdated: "2023-06-28" },
];

// Define project structure interface
interface Project {
  id: string;
  name: string;
  type: string;
  location: string;
  lastUpdated: string;
  modelPath?: string;
}

export default function Modelo3DPage() {
  const { hasPermission } = useAuth();
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddProject, setShowAddProject] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    type: 'Comercial',
    location: '',
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);

  // Filter projects based on search term
  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Initialize Three.js scene
  useEffect(() => {
    if (!canvasRef.current || selectedProject === null) return;

    // Initialize scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    sceneRef.current = scene;

    // Initialize camera
    const camera = new THREE.PerspectiveCamera(75, canvasRef.current.clientWidth / canvasRef.current.clientHeight, 0.1, 1000);
    camera.position.set(5, 5, 5);
    cameraRef.current = camera;

    // Initialize renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true
    });
    renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;

    // Add orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Add grid helper
    const gridHelper = new THREE.GridHelper(20, 20);
    scene.add(gridHelper);

    // Add axes helper
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      if (controlsRef.current) {
        controlsRef.current.update();
      }

      if (rendererRef.current && cameraRef.current && sceneRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animate();

    // Load model if available
    if (selectedProject.modelPath) {
      const loader = new GLTFLoader();
      loader.load(
        selectedProject.modelPath,
        (gltf) => {
          if (modelRef.current && sceneRef.current) {
            sceneRef.current.remove(modelRef.current);
          }

          modelRef.current = gltf.scene;

          // Center model
          const box = new THREE.Box3().setFromObject(gltf.scene);
          const center = box.getCenter(new THREE.Vector3());
          gltf.scene.position.sub(center);

          if (sceneRef.current) {
            sceneRef.current.add(gltf.scene);
          }
        },
        (xhr) => {
          console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        (error) => {
          console.error('Error loading model:', error);
        }
      );
    } else {
      // If no model, show a default cube
      const geometry = new THREE.BoxGeometry();
      const material = new THREE.MeshStandardMaterial({ color: 0x3f88c5 });
      const cube = new THREE.Mesh(geometry, material);
      cube.castShadow = true;
      cube.receiveShadow = true;
      scene.add(cube);

      // Animation for the cube
      const animateCube = () => {
        requestAnimationFrame(animateCube);
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
      };

      animateCube();
    }

    // Handle window resize
    const handleResize = () => {
      if (!canvasRef.current || !cameraRef.current || !rendererRef.current) return;

      cameraRef.current.aspect = canvasRef.current.clientWidth / canvasRef.current.clientHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);

      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, [selectedProject]);

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !selectedProject) return;

    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);

    // Simulate upload delay
    setTimeout(() => {
      // Update project with model path
      const updatedProjects = projects.map(project => {
        if (project.id === selectedProject.id) {
          return {
            ...project,
            modelPath: URL.createObjectURL(file),
            lastUpdated: new Date().toISOString().split('T')[0]
          };
        }
        return project;
      });

      setProjects(updatedProjects);
      setSelectedProject(
        updatedProjects.find(p => p.id === selectedProject.id) || null
      );

      setIsUploading(false);
    }, 1500);
  };

  // Handle add new project
  const handleAddProject = () => {
    if (!newProject.name || !newProject.location) return;

    const newId = (projects.length + 1).toString();
    const newProjectEntry: Project = {
      id: newId,
      name: newProject.name,
      type: newProject.type,
      location: newProject.location,
      lastUpdated: new Date().toISOString().split('T')[0]
    };

    setProjects([...projects, newProjectEntry]);
    setNewProject({
      name: '',
      type: 'Comercial',
      location: '',
    });
    setShowAddProject(false);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Visualização de Modelos 3D</h1>
        {hasPermission('create:project') && (
          <Button
            onClick={() => setShowAddProject(!showAddProject)}
            className="flex items-center gap-1"
          >
            {showAddProject ? <FiX /> : <FiPlus />}
            {showAddProject ? 'Cancelar' : 'Novo Projeto'}
          </Button>
        )}
      </div>

      {showAddProject && (
        <Card>
          <CardHeader>
            <CardTitle>Adicionar Novo Projeto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="project-name">Nome do Projeto</Label>
                <Input
                  id="project-name"
                  value={newProject.name}
                  onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                  placeholder="Digite o nome do projeto"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="project-type">Tipo de Projeto</Label>
                <Select
                  value={newProject.type}
                  onValueChange={(value) => setNewProject({...newProject, type: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Comercial">Comercial</SelectItem>
                    <SelectItem value="Residencial">Residencial</SelectItem>
                    <SelectItem value="Infraestrutura">Infraestrutura</SelectItem>
                    <SelectItem value="Industrial">Industrial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="project-location">Localização</Label>
                <Input
                  id="project-location"
                  value={newProject.location}
                  onChange={(e) => setNewProject({...newProject, location: e.target.value})}
                  placeholder="Cidade - Estado"
                />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <Button
                  onClick={handleAddProject}
                  disabled={!newProject.name || !newProject.location}
                >
                  Adicionar Projeto
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Projetos</CardTitle>
              <div className="mt-2">
                <Input
                  placeholder="Buscar projetos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {filteredProjects.length > 0 ? filteredProjects.map(project => (
                  <div
                    key={project.id}
                    className={`p-3 rounded-md cursor-pointer transition-colors ${selectedProject?.id === project.id ? 'bg-blue-100' : 'hover:bg-slate-100'}`}
                    onClick={() => setSelectedProject(project)}
                  >
                    <div className="font-medium">{project.name}</div>
                    <div className="text-sm text-gray-500 flex justify-between">
                      <span>{project.type}</span>
                      <span>{project.location}</span>
                    </div>
                  </div>
                )) : (
                  <div className="text-center text-gray-500 py-4">
                    {searchTerm ? 'Nenhum projeto encontrado' : 'Nenhum projeto disponível'}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {selectedProject ? (
            <>
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>{selectedProject.name}</CardTitle>
                    {hasPermission('edit:project') && (
                      <Button className="flex gap-1 items-center" size="sm" asChild>
                        <label htmlFor="model-upload">
                          <FiUpload className="mr-1" />
                          {isUploading ? 'Enviando...' : 'Enviar Modelo'}
                          <input
                            id="model-upload"
                            type="file"
                            accept=".gltf,.glb"
                            className="hidden"
                            onChange={handleFileUpload}
                            disabled={isUploading}
                          />
                        </label>
                      </Button>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 flex justify-between">
                    <span>Tipo: {selectedProject.type}</span>
                    <span>Localização: {selectedProject.location}</span>
                    <span>Atualizado em: {selectedProject.lastUpdated}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="view" className="w-full">
                    <TabsList className="w-full mb-4">
                      <TabsTrigger value="view">Visualização 3D</TabsTrigger>
                      <TabsTrigger value="analysis">Análise Estrutural</TabsTrigger>
                      <TabsTrigger value="reports">Relatórios</TabsTrigger>
                    </TabsList>
                    <TabsContent value="view" className="w-full">
                      <div className="relative bg-gray-100 rounded-md" style={{ height: '500px' }}>
                        <canvas ref={canvasRef} className="w-full h-full" />

                        {!selectedProject.modelPath && (
                          <div className="absolute top-2 right-2 bg-white px-3 py-1 rounded-md text-xs text-gray-600 shadow-sm">
                            Modelo de amostra (sem arquivo carregado)
                          </div>
                        )}

                        <div className="absolute bottom-2 right-2 bg-white p-2 rounded-md shadow-sm">
                          <div className="flex items-center space-x-2 text-xs text-gray-600">
                            <span>X: Vermelho</span>
                            <span>Y: Verde</span>
                            <span>Z: Azul</span>
                          </div>
                        </div>
                      </div>
                      {!selectedProject.modelPath && (
                        <div className="mt-4 p-4 border border-dashed border-gray-300 rounded-md text-center">
                          <FiFile className="mx-auto h-10 w-10 text-gray-400" />
                          <p className="mt-2 text-sm text-gray-600">
                            Nenhum modelo 3D disponível para este projeto.
                          </p>
                          {hasPermission('edit:project') && (
                            <Button className="mt-2" size="sm" variant="outline" asChild>
                              <label htmlFor="model-upload-alt">
                                <FiUpload className="mr-1" />
                                Enviar Modelo GLTF/GLB
                                <input
                                  id="model-upload-alt"
                                  type="file"
                                  accept=".gltf,.glb"
                                  className="hidden"
                                  onChange={handleFileUpload}
                                  disabled={isUploading}
                                />
                              </label>
                            </Button>
                          )}
                        </div>
                      )}
                    </TabsContent>
                    <TabsContent value="analysis">
                      <div className="border border-dashed border-gray-300 rounded-md p-10 text-center">
                        <h3 className="text-xl font-medium text-gray-700">Análise Estrutural</h3>
                        <p className="text-gray-500">Ferramentas de análise estrutural estarão disponíveis em breve.</p>
                      </div>
                    </TabsContent>
                    <TabsContent value="reports">
                      <div className="border border-dashed border-gray-300 rounded-md p-10 text-center">
                        <h3 className="text-xl font-medium text-gray-700">Relatórios Técnicos</h3>
                        <p className="text-gray-500">Ferramentas de geração de relatórios estarão disponíveis em breve.</p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center" style={{ height: '500px' }}>
                <div className="text-center">
                  <h3 className="text-xl font-medium text-gray-700">Nenhum projeto selecionado</h3>
                  <p className="text-gray-500 mt-1">Selecione um projeto da lista para visualizar seus modelos 3D</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
