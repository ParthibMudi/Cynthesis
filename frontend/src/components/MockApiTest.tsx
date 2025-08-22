import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MockApiTest = () => {
  const [testResults, setTestResults] = useState<{
    frontend: boolean;
    backend: boolean;
    database: boolean;
  }>({
    frontend: true,
    backend: false,
    database: false
  });

  const [loading, setLoading] = useState(false);

  const runTest = () => {
    setLoading(true);
    
    // Simulate API testing
    setTimeout(() => {
      setTestResults({
        frontend: true,
        backend: true,
        database: true
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>End-to-End Integration Test</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg ${testResults.frontend ? 'bg-green-100' : 'bg-gray-100'}`}>
              <h3 className="font-medium">Frontend</h3>
              <div className="mt-2">
                {testResults.frontend ? 
                  <span className="text-green-600">✓ Ready</span> : 
                  <span className="text-gray-500">Pending</span>}
              </div>
            </div>
            
            <div className={`p-4 rounded-lg ${testResults.backend ? 'bg-green-100' : 'bg-gray-100'}`}>
              <h3 className="font-medium">Backend</h3>
              <div className="mt-2">
                {testResults.backend ? 
                  <span className="text-green-600">✓ Connected</span> : 
                  <span className="text-gray-500">Pending</span>}
              </div>
            </div>
            
            <div className={`p-4 rounded-lg ${testResults.database ? 'bg-green-100' : 'bg-gray-100'}`}>
              <h3 className="font-medium">MongoDB</h3>
              <div className="mt-2">
                {testResults.database ? 
                  <span className="text-green-600">✓ Connected</span> : 
                  <span className="text-gray-500">Pending</span>}
              </div>
            </div>
          </div>
          
          <Button 
            onClick={runTest} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Testing Integration...' : 'Test Integration'}
          </Button>
          
          {testResults.frontend && testResults.backend && testResults.database && (
            <div className="p-3 bg-green-100 rounded-lg text-center">
              <p className="text-green-800 font-medium">✓ End-to-End Integration Complete!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MockApiTest;