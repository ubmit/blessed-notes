import {Outlet, createRootRoute} from '@tanstack/react-router';
import '../styles/globals.css';

export const Route = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Outlet />
    </div>
  ),
});
