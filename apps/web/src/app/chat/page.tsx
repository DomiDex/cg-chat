import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const metadata = {
  title: 'Chat',
  description: 'Chat with Computer Guys AI Assistant',
};

export default function ChatPage() {
  return (
    <main className="flex h-screen flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Computer Guys Chat</h1>
        </div>
      </header>
      
      <div className="flex-1 container mx-auto px-4 py-8">
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle>Chat Assistant</CardTitle>
            <CardDescription>
              How can I help you today?
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            {/* Messages area */}
            <div className="flex-1 overflow-y-auto mb-4 p-4 border rounded-lg bg-slate-50 dark:bg-slate-900">
              <div className="text-center text-muted-foreground">
                <p>Welcome! Start a conversation by typing below.</p>
                <p className="text-sm mt-2">This feature will be connected to Convex backend soon.</p>
              </div>
            </div>
            
            {/* Input area */}
            <div className="flex gap-2">
              <Input 
                placeholder="Type your message..."
                className="flex-1"
                disabled
              />
              <Button disabled>Send</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}