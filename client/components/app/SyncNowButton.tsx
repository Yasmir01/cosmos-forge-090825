export default function SyncNowButton({ onSync }: { onSync?: () => void }) {
  return (
    <button
      onClick={onSync}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
    >
      Sync Now
    </button>
  );
}
