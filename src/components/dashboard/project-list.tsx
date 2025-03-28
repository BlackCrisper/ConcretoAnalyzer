"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FiFileText } from "react-icons/fi";
import { Button } from '@/components/ui/button';

interface Project {
  id: string;
  name: string;
  company: string;
  date: string;
  status: 'completo' | 'em_andamento' | 'pausado';
}

interface ProjectListProps {
  title: string;
  projects: Project[];
  viewAllLink?: string;
}

export function ProjectList({ title, projects, viewAllLink }: ProjectListProps) {
  const getStatusClass = (status: Project['status']) => {
    switch (status) {
      case 'completo':
        return 'bg-green-100 text-green-800';
      case 'em_andamento':
        return 'bg-blue-100 text-blue-800';
      case 'pausado':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Project['status']) => {
    switch (status) {
      case 'completo':
        return 'completo';
      case 'em_andamento':
        return 'em andamento';
      case 'pausado':
        return 'pausado';
      default:
        return status;
    }
  };

  return (
    <Card>
      <CardHeader className="space-y-1.5 p-6 flex flex-row items-center justify-between">
        <CardTitle className="text-2xl font-semibold leading-none tracking-tight">{title}</CardTitle>
        {viewAllLink && (
          <Button variant="outline" size="sm" asChild>
            <a href={viewAllLink}>Ver todos</a>
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <div className="space-y-4">
          {projects.map((project) => (
            <div key={project.id} className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                <FiFileText className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{project.name}</p>
                <p className="text-xs text-muted-foreground truncate">{project.company}</p>
              </div>
              <div className="flex-shrink-0 text-right">
                <p className="text-sm text-muted-foreground">{project.date}</p>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusClass(project.status)}`}>
                  {getStatusText(project.status)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
