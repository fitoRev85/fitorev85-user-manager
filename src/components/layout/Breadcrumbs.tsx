
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Home, BarChart3, TrendingUp, FileText, DollarSign, Users } from 'lucide-react';

const routeMap: Record<string, { label: string; icon: React.ReactNode }> = {
  '/': { label: 'Dashboard', icon: <Home className="w-4 h-4" /> },
  '/properties': { label: 'Propriedades', icon: <Home className="w-4 h-4" /> },
  '/executive': { label: 'Dashboard Executivo', icon: <BarChart3 className="w-4 h-4" /> },
  '/analysis': { label: 'Análises', icon: <TrendingUp className="w-4 h-4" /> },
  '/reports': { label: 'Relatórios', icon: <FileText className="w-4 h-4" /> },
  '/financial': { label: 'Financeiro', icon: <DollarSign className="w-4 h-4" /> },
  '/users': { label: 'Usuários', icon: <Users className="w-4 h-4" /> },
};

export const Breadcrumbs = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  // Build breadcrumb items
  const breadcrumbItems = [
    { path: '/', ...routeMap['/'] }
  ];

  let currentPath = '';
  pathSegments.forEach(segment => {
    currentPath += `/${segment}`;
    const route = routeMap[currentPath];
    if (route) {
      breadcrumbItems.push({ path: currentPath, ...route });
    } else {
      // Handle dynamic routes (like /rms/:propertyId)
      if (segment.match(/^[0-9]+$/)) {
        breadcrumbItems.push({ 
          path: currentPath, 
          label: `Propriedade ${segment}`, 
          icon: <Home className="w-4 h-4" /> 
        });
      } else {
        breadcrumbItems.push({ 
          path: currentPath, 
          label: segment.charAt(0).toUpperCase() + segment.slice(1), 
          icon: <BarChart3 className="w-4 h-4" /> 
        });
      }
    }
  });

  // Don't show breadcrumbs if we're on the home page
  if (breadcrumbItems.length <= 1) {
    return null;
  }

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        {breadcrumbItems.map((item, index) => (
          <React.Fragment key={item.path}>
            <BreadcrumbItem>
              {index === breadcrumbItems.length - 1 ? (
                <BreadcrumbPage className="text-slate-300 flex items-center gap-2">
                  {item.icon}
                  {item.label}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link to={item.path} className="text-slate-400 hover:text-white flex items-center gap-2">
                    {item.icon}
                    {item.label}
                  </Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {index < breadcrumbItems.length - 1 && (
              <BreadcrumbSeparator className="text-slate-600" />
            )}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
