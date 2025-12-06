import './App.css';

const App = () => {
  return (
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
};

export default App;
