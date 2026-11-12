export default function formatDate(iso) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric' });
}
