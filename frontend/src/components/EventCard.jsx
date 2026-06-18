// frontend/src/components/EventCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users } from 'lucide-react';

const EventCard = ({ event }) => {
  const navigate = useNavigate();
  const date = new Date(event.dateTime);
  
  return (
    <div 
      onClick={() => navigate(`/events/${event._id}`)}
      className="bg-surface border border-gray-800 rounded-xl p-6 cursor-pointer hover:border-primary/50 transition-all hover:-translate-y-1 group"
    >
      <h3 className="text-xl font-semibold mb-4 group-hover:text-primary transition-colors">{event.name}</h3>
      <div className="space-y-3 text-textMuted text-sm">
        <div className="flex items-center gap-3">
          <Calendar size={16} className="text-primary" />
          <span>{date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div className="flex items-center gap-3">
          <MapPin size={16} className="text-primary" />
          <span>{event.venue}</span>
        </div>
        <div className="flex items-center gap-3">
          <Users size={16} className="text-primary" />
          <span>{event.totalSeats} Total Seats</span>
        </div>
      </div>
      <div className="mt-6 pt-4 border-t border-gray-800 flex justify-between items-center">
        <span className="text-sm font-medium text-textPrimary">View Details</span>
        <span className="text-primary text-xl">→</span>
      </div>
    </div>
  );
};

export default EventCard;
