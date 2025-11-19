import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRequireToken } from '../../hooks/useRequireToken.js';
import { fetchPlaylistById } from '../../api/spotify-playlists.js';
import TrackItem from '../../components/TrackItem/TrackItem.jsx';
import { handleTokenError } from '../../utils/handleTokenError.js';
import './DetailPlaylistPage.css';

export default function DetailPlaylistPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useRequireToken();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = 'Playlist | Spotify App';
    if (!token || !id) return;
    fetchPlaylistById(token, id)
      .then(res => {
        // Support both {playlist, error} and {data, error} for test/mock compatibility
        const playlistObj = res.data || res.playlist;
        if (res.error) {
          if (!handleTokenError(res.error, navigate)) {
            setError(res.error);
          }
        } else if (!playlistObj) {
          setError('Failed to fetch playlist');
        } else {
          setPlaylist(playlistObj);
        }
      })
      .catch(err => setError(err.message || 'API error occurred'))
      .finally(() => setLoading(false));
  }, [token, id, navigate]);

  if (loading) return <output role="status" data-testid="loading-indicator">Loading playlist…</output>;
  if (error) return <div role="alert">{error}</div>;
  // Affiche "No playlist found" seulement si playlist === null et pas d'erreur
  if (playlist === null && !error) return <div>No playlist found.</div>;

  return (
    <section className="playlist-detail-container" aria-labelledby="playlist-title">
      <h1 id="playlist-title" role="heading" aria-level="1">{playlist?.name}</h1>
      {playlist?.images?.[0]?.url && (
        <img src={playlist.images[0].url} alt={`Cover of ${playlist.name}`} style={{ maxWidth: 200, borderRadius: 8 }} />
      )}
      <h2 role="heading" aria-level="2">{playlist?.description}</h2>
      <button
        className="playlist-play-btn"
        onClick={() => window.open(playlist.external_urls?.spotify, '_blank', 'noopener,noreferrer')}
        style={{ marginBottom: '1rem', padding: '0.5rem 1rem', background: '#1db954', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
      >
        Lire la playlist
      </button>
      <a href={playlist.external_urls?.spotify} target="_blank" rel="noopener noreferrer">Open in Spotify</a>
      <h2>Tracks</h2>
      {playlist?.tracks?.items?.length === 0 ? (
        <div>Aucune piste dans cette playlist.</div>
      ) : (
        <ol>
          {playlist?.tracks?.items?.map((item, i) => (
            <TrackItem key={item.track.id || i} track={item.track} data-testid={`track-item-${item.track.id}`} />
          ))}
        </ol>
      )}
    </section>
  );
}
