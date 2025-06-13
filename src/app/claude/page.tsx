import ClaudeChat from '../../components/ClaudeChat';

export const metadata = {
  title: 'Chat with Claude - StagemateAI',
  description: 'Interact with Claude AI by Anthropic',
};

export default function ClaudePage() {
  return (
    <main className="container mx-auto py-8">
      <ClaudeChat />
    </main>
  );
}
