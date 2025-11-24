import { fetchPlaylistById } from '../api/spotify-playlists.js';

/**
 * Compte le nombre d'apparitions de chaque artiste dans une playlist Spotify.
 * @param {string} token - Token d'accès Spotify
 * @param {string} playlistId - ID de la playlist
 * @returns {Promise<Object|undefined>} - Objet { nomArtiste: nombre } ou undefined en cas d'erreur
 */
export async function artistCountForPlaylist(token, playlistId) {
  try {
    const res = await fetchPlaylistById(token, playlistId);
    if (res.error) throw new Error(res.error);
    const playlist = res.data || res.playlist;
    if (!playlist || !playlist.tracks || !playlist.tracks.items) return {};

    const count = {};
    for (const item of playlist.tracks.items) {
      const track = item.track;
      if (track && Array.isArray(track.artists)) {
        for (const artist of track.artists) {
          if (artist && artist.name) {
            count[artist.name] = (count[artist.name] || 0) + 1;
          }
        }
      }
    }
    return count;
  } catch (err) {
    // Pour les tests, retourne undefined et log l'erreur
    console.error('Error fetching playlist', err);
    return undefined;
  }
}
