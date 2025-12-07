import './App.css';
import {
  Outlet,
  RouterProvider,
  createRouter,
  createRoute,
  createRootRoute,
} from '@tanstack/react-router';

const Home = () => (
  <div className="content">
    <h1>AWS S3 Static Site Sample</h1>
    <p>This is a minimal sample static website built with:</p>
    <ul>
      <li>Frontend: React + TypeScript + Rsbuild + Rspack</li>
      <li>Infrastructure: AWS CDK v2 (TypeScript)</li>
      <li>Hosting: S3 + CloudFront + WAF</li>
    </ul>
    <p>Status: Successfully deployed!</p>
  </div>
);

const NotFound = () => (
  <div className="content">
    <h1>404 Not Found</h1>
    <p>The requested page could not be found.</p>
  </div>
);

const rootRoute = createRootRoute({
  component: () => <Outlet />,
  notFoundComponent: NotFound,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Home,
});

const routeTree = rootRoute.addChildren([indexRoute]);

const router = createRouter({
  routeTree,
  basepath: '/console',
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
