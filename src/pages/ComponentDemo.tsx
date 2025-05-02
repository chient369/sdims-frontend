import React from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Alert } from '../components/ui/Alert';
import { Heading, Text } from '../components/ui/Typography';
import { ThemeToggle } from '../components/ui/ThemeToggle';

const ComponentDemo: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <Heading level={1}>SDIMS Design System</Heading>
        <ThemeToggle />
      </div>
      
      <div className="grid gap-8">
        {/* Typography Section */}
        <section>
          <Heading level={2} className="mb-4">Typography</Heading>
          <div className="grid gap-4">
            <div>
              <Heading level={1}>Heading 1</Heading>
              <Heading level={2}>Heading 2</Heading>
              <Heading level={3}>Heading 3</Heading>
              <Heading level={4}>Heading 4</Heading>
              <Heading level={5}>Heading 5</Heading>
              <Heading level={6}>Heading 6</Heading>
            </div>
            <div>
              <Text size="xl" variant="default">Text Extra Large</Text>
              <Text size="lg" variant="default">Text Large</Text>
              <Text size="base" variant="default">Text Base</Text>
              <Text size="sm" variant="default">Text Small</Text>
              <Text size="xs" variant="default">Text Extra Small</Text>
            </div>
            <div>
              <Text variant="default">Default Text</Text>
              <Text variant="muted">Muted Text</Text>
              <Text variant="subtle">Subtle Text</Text>
              <Text variant="primary">Primary Text</Text>
            </div>
          </div>
        </section>
        
        {/* Buttons Section */}
        <section>
          <Heading level={2} className="mb-4">Buttons</Heading>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="default">Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="success">Success</Button>
            <Button isLoading>Loading</Button>
          </div>
          <div className="grid grid-cols-4 gap-4 mt-4">
            <Button size="xs">Extra Small</Button>
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>
        </section>
        
        {/* Inputs Section */}
        <section>
          <Heading level={2} className="mb-4">Inputs</Heading>
          <div className="grid gap-4">
            <Input placeholder="Default input" />
            <Input placeholder="Success input" success="This is a success message" />
            <Input placeholder="Error input" error="This is an error message" />
            <div className="grid grid-cols-3 gap-4">
              <Input size="sm" placeholder="Small input" />
              <Input size="md" placeholder="Medium input" />
              <Input size="lg" placeholder="Large input" />
            </div>
          </div>
        </section>
        
        {/* Cards Section */}
        <section>
          <Heading level={2} className="mb-4">Cards</Heading>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Card Title</CardTitle>
                <CardDescription>Card description goes here</CardDescription>
              </CardHeader>
              <CardContent>
                <Text>This is the main content of the card.</Text>
              </CardContent>
              <CardFooter>
                <Button>Action</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <Text>A simple card without header and footer.</Text>
              </CardContent>
            </Card>
          </div>
        </section>
        
        {/* Badges Section */}
        <section>
          <Heading level={2} className="mb-4">Badges</Heading>
          <div className="flex flex-wrap gap-2">
            <Badge variant="default">Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="error">Error</Badge>
            <Badge variant="info">Info</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge size="sm">Small</Badge>
            <Badge size="md">Medium</Badge>
            <Badge size="lg">Large</Badge>
          </div>
        </section>
        
        {/* Alerts Section */}
        <section>
          <Heading level={2} className="mb-4">Alerts</Heading>
          <div className="grid gap-4">
            <Alert>This is a default alert</Alert>
            <Alert variant="info" title="Information">This is an info alert with a title</Alert>
            <Alert variant="success" title="Success">This is a success alert with a title</Alert>
            <Alert variant="warning" title="Warning">This is a warning alert with a title</Alert>
            <Alert variant="error" title="Error">This is an error alert with a title</Alert>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ComponentDemo; 