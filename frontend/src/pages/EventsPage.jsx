// frontend/src/pages/EventsPage.jsx
import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import EventCard from '../components/EventCard';
import { CalendarDays } from 'lucide-react';

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get('/events');
        setEvents(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load events. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-8">Upcoming Events</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-surface border border-gray-800 rounded-xl p-6 h-48 animate-pulse">
              <div className="h-6 bg-gray-800 rounded w-3/4 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-800 rounded w-1/2"></div>
                <div className="h-4 bg-gray-800 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="text-error text-xl mb-4">{error}</div>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex items-center gap-4 mb-10">
        <div className="p-3 bg-primary/20 rounded-xl">
          <CalendarDays size={32} className="text-primary" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-white">Upcoming Events</h1>
          <p className="text-textMuted mt-1">Discover and book tickets for the best events in town</p>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-20 bg-surface rounded-2xl border border-gray-800">
          <h3 className="text-xl text-white font-medium mb-2">No events found</h3>
          <p className="text-textMuted">Check back later for new events.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event._id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
};

export default EventsPage;
