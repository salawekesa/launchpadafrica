import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth-store';
import { useHackathonStore } from '../services/hackathon-store';
import { CreateHackathonForm } from '../components/CreateHackathonForm';
import type { CreateHackathonInput } from '../types';

export function CreateHackathon() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { createHackathon } = useHackathonStore();

  if (!user) {
    return (
      <div className="container py-8">
        <p className="text-muted-foreground">Please log in to create a hackathon.</p>
      </div>
    );
  }

  const handleSubmit = async (input: CreateHackathonInput) => {
    const hackathon = await createHackathon({ ...input, hostId: user.id });
    navigate(`/hackathon/${hackathon.id}/manage`, { replace: true });
  };

  return (
    <div className="container py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Create a hackathon</h1>
      <CreateHackathonForm
        hostId={user.id}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/hackathons')}
      />
    </div>
  );
}
