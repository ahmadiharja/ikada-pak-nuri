'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Database, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface DatabaseStatus {
  success: boolean;
  message: string;
  data?: {
    current_time: string;
    postgres_version: string;
    connection_info: string;
  };
  error?: string;
}

export function DatabaseStatus() {
  const [status, setStatus] = useState<DatabaseStatus | null>(null);
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-db');
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      setStatus({
        success: false,
        message: 'Failed to test connection',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Connection Status
        </CardTitle>
        <CardDescription>
          Status koneksi ke Neon PostgreSQL Database
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : status?.success ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm font-medium">
              {loading ? 'Testing...' : status?.message || 'Unknown'}
            </span>
          </div>
          <Badge variant={status?.success ? 'default' : 'destructive'}>
            {status?.success ? 'Connected' : 'Disconnected'}
          </Badge>
        </div>

        {status?.data && (
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Current Time:</span>
              <span className="ml-2 text-muted-foreground">
                {new Date(status.data.current_time).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="font-medium">PostgreSQL Version:</span>
              <span className="ml-2 text-muted-foreground">
                {status.data.postgres_version.split(' ')[0]}
              </span>
            </div>
            <div>
              <span className="font-medium">Connection:</span>
              <span className="ml-2 text-muted-foreground">
                {status.data.connection_info}
              </span>
            </div>
          </div>
        )}

        {status?.error && (
          <div className="text-sm text-red-500">
            <span className="font-medium">Error:</span>
            <span className="ml-2">{status.error}</span>
          </div>
        )}

        <Button 
          onClick={testConnection} 
          disabled={loading}
          variant="outline"
          size="sm"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Database className="h-4 w-4 mr-2" />
          )}
          Test Connection
        </Button>
      </CardContent>
    </Card>
  );
}