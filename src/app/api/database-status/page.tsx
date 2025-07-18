'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Database, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
interface DatabaseStatus {
  connected: boolean
  error?: string
  tables: Array<{
    name: string
    count: number
    exists: boolean
  }>
  version?: string
  environment: {
    DATABASE_URL: boolean
    JWT_SECRET: boolean
  }
}
export default function DatabaseStatusPage(): JSX.Element {
  const [status, setStatus] = useState<DatabaseStatus | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [creating, setCreating] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const checkDatabaseStatus = async (): Promise<void> => {
    try {
      setLoading(true)
      setError('')
      
      const response = await fetch('/api/check-tables')
      const data = await response.json()      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to check database status')
      }      
      setStatus(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }
  const createTables = async (): Promise<void> => {
    try {
      setCreating(true)
      setError('')      
      const response = await fetch('/api/force-create-tables', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })      
      const data = await response.json()      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create tables')
      }
      await checkDatabaseStatus()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create tables')
    } finally {
      setCreating(false)
    }
  }
  useEffect(() => {
    checkDatabaseStatus()
  }, [])

  if (loading && !status) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Checking database status...</p>
        </div>
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Database Status</h1>
          <p className="text-gray-600">Monitor and manage your tic-tac-toe game database</p>
        </div>
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}
        <div className="grid gap-6 md:grid-cols-2">
          {}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Connection Status
              </CardTitle>
              <CardDescription>
                PostgreSQL database connection information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Database Connection</span>
                  {status?.connected ? (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Connected
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <XCircle className="h-3 w-3 mr-1" />
                      Disconnected
                    </Badge>
                  )}
                </div>                
                {status?.version && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">PostgreSQL Version</span>
                    <span className="text-sm text-gray-600">{status.version}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">DATABASE_URL</span>
                  {status?.environment.DATABASE_URL ? (
                    <Badge variant="default" className="bg-green-100 text-green-800">Configured</Badge>
                  ) : (
                    <Badge variant="destructive">Missing</Badge>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">JWT_SECRET</span>
                  {status?.environment.JWT_SECRET ? (
                    <Badge variant="default" className="bg-green-100 text-green-800">Configured</Badge>
                  ) : (
                    <Badge variant="destructive">Missing</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          {}
          <Card>
            <CardHeader>
              <CardTitle>Database Tables</CardTitle>
              <CardDescription>
                Status of required tables for the tic-tac-toe game
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {status?.tables.map((table) => (
                  <div key={table.name} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{table.name}</span>
                    <div className="flex items-center gap-2">
                      {table.exists ? (
                        <>
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            {table.count} records
                          </Badge>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </>
                      ) : (
                        <>
                          <Badge variant="destructive">Missing</Badge>
                          <XCircle className="h-4 w-4 text-red-600" />
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        {}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Database Actions</CardTitle>
            <CardDescription>
              Manage your database tables and connection
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button 
                onClick={checkDatabaseStatus}
                disabled={loading}
                variant="outline"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Refresh Status
              </Button>
              <Button 
                onClick={createTables}
                disabled={creating || !status?.connected}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {creating ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Database className="h-4 w-4 mr-2" />
                )}
                Force Create Tables
              </Button>
              <Button 
                onClick={() => window.open('/', '_blank')}
                variant="outline"
              >
                Test Game
              </Button>
            </div>
          </CardContent>
        </Card>
        {}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>1. Check Connection:</strong> Ensure your PostgreSQL database is running and accessible.</p>
              <p><strong>2. Create Tables:</strong> If tables are missing, click "Force Create Tables" to set them up.</p>
              <p><strong>3. Test Game:</strong> Once tables exist, test the signup and game functionality.</p>
              <p><strong>4. Troubleshoot:</strong> If issues persist, check your .env file and PostgreSQL configuration.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}