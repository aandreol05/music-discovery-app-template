import React, { useEffect, useState } from 'react';
import { fetchUserTopArtists, fetchUserTopTracks } from '../../api/spotify-me.js';
import { useRequireToken } from '../../hooks/useRequireToken.js';
import SimpleCard from '../../components/SimpleCard/SimpleCard.jsx';
import './DashboardPage.css';
import { buildTitle } from '../../constants/appMeta.js';
import { handleTokenError } from '../../utils/handleTokenError.js';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { token } = useRequireToken();
  const [topArtist, setTopArtist] = useState(null);
  const [topTrack, setTopTrack] = useState(null);
  const [errorArtist, setErrorArtist] = useState(null);
  const [errorTrack, setErrorTrack] = useState(null);
  const [loadingArtist, setLoadingArtist] = useState(true);
  const [loadingTrack, setLoadingTrack] = useState(true);

  useEffect(() => {
    document.title = buildTitle('Dashboard');
    if (!token) return;
    fetchUserTopArtists(token, 1, 'short_term')
      .then(res => {
        if (res.error) {
          if (!handleTokenError(res.error, navigate)) {
            setErrorArtist(res.error);
          }
        }
        if (res.data && res.data.items && res.data.items.length > 0) {
          setTopArtist(res.data.items[0]);
          setErrorArtist(null);
        } else if (!res.data || !res.data.items || res.data.items.length === 0) {
          setTopArtist(null);
        }
      })
      .catch(() => setErrorArtist('Network error for artists'))
      .finally(() => setLoadingArtist(false));

    fetchUserTopTracks(token, 1, 'short_term')
      .then(res => {
        if (res.error) {
          if (!handleTokenError(res.error, navigate)) {
            setErrorTrack(res.error);
          }
        }
        if (res.data && res.data.items && res.data.items.length > 0) {
          setTopTrack(res.data.items[0]);
          setErrorTrack(null);
        } else if (!res.data || !res.data.items || res.data.items.length === 0) {
          setTopTrack(null);
        }
      })
      .catch(() => setErrorTrack('Network error for tracks'))
      .finally(() => setLoadingTrack(false));
  }, [token, navigate]);

  return (
    <section className="dashboard-container page-container" aria-labelledby="dashboard-title">
      <h1 id="dashboard-title" className="page-title dashboard-title">Dashboard</h1>
      <div className="dashboard-subtitle">Your top artist and track</div>
      {loadingArtist && !errorArtist && !topArtist && (
        <output data-testid="loading-artists-indicator" className="dashboard-loading">Loading artists…</output>
      )}
      {loadingTrack && !errorTrack && !topTrack && (
        <output data-testid="loading-tracks-indicator" className="dashboard-loading">Loading tracks…</output>
      )}
      {errorArtist && (
        <div data-testid="error-artists-indicator" className="dashboard-error" role="alert">{errorArtist}</div>
      )}
      {errorTrack && (
        <div data-testid="error-tracks-indicator" className="dashboard-error" role="alert">{errorTrack}</div>
      )}
      <div className="dashboard-content">
        {topArtist && (
          <section className="dashboard-section dashboard-top-artist" aria-label="Artiste le plus écouté">
            <SimpleCard
              imageUrl={topArtist.images?.[0]?.url}
              title={topArtist.name}
              subtitle={`Genres : ${topArtist.genres.join(', ')}`}
              className="simple-card card"
              link={topArtist.external_urls?.spotify}
            >
              <h2 className="dashboard-section-title">Artiste le plus écouté</h2>
            </SimpleCard>
          </section>
        )}
        {topTrack && (
          <section className="dashboard-section dashboard-top-track" aria-label="Piste la plus écoutée">
            <SimpleCard
              imageUrl={topTrack.album?.images?.[0]?.url}
              title={topTrack.name}
              subtitle={topTrack.artists.map(a => a.name).join(', ')}
              className="simple-card card"
              link={topTrack.external_urls?.spotify}
              buttonText="Learn More"
            >
              <h2 className="dashboard-section-title">Piste la plus écoutée</h2>
              <div>Album : {topTrack.album?.name}</div>
            </SimpleCard>
          </section>
        )}
      </div>
    </section>
  );
}