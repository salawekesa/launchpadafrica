import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CreateHackathonInput } from '../types';

interface CreateHackathonFormProps {
  hostId: string;
  onSubmit: (input: CreateHackathonInput) => void;
  onCancel?: () => void;
}

const DEFAULT_AWARDS = [
  { name: '1st Place', rank: 1, prize: '₳10,000 + Incubation' },
  { name: '2nd Place', rank: 2, prize: '₳5,000' },
  { name: '3rd Place', rank: 3, prize: '₳2,500' },
];

const DEFAULT_CRITERIA = [
  { name: 'Innovation', description: 'Originality and creativity', weight: 25, order: 0 },
  { name: 'Technical execution', description: 'Quality of implementation', weight: 25, order: 1 },
  { name: 'Impact', description: 'Potential impact on target users', weight: 25, order: 2 },
  { name: 'Presentation', description: 'Pitch and demo quality', weight: 25, order: 3 },
];

export function CreateHackathonForm({ hostId, onSubmit, onCancel }: CreateHackathonFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [location, setLocation] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      description,
      startDate,
      endDate,
      location,
      hostId,
      awards: DEFAULT_AWARDS,
      criteria: DEFAULT_CRITERIA,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Create Hackathon</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. AfroTech Hackathon 2025"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this hackathon about?"
              rows={4}
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Nairobi, Kenya or Virtual"
              required
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Default awards (1st, 2nd, 3rd) and judging criteria (Innovation, Technical, Impact, Presentation) are included. You can edit them after creation.
          </p>
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="glow-primary">
              Create Hackathon
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
