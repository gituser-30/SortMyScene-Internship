// frontend/src/pages/EventDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import SeatGrid from '../components/SeatGrid';
import CountdownTimer from '../components/CountdownTimer';
import BookingConfirmModal from '../components/BookingConfirmModal';
import { Calendar, MapPin, Ticket } from 'lucide-react';

const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [seats, setSeats] = useState([]);
  const [seatSummary, setSeatSummary] = useState({ available: 0, reserved: 0, booked: 0 });
  const [selectedSeats, setSelectedSeats] = useState(new Set());
  const [reservation, setReservation] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmedSeats, setConfirmedSeats] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const fetchEventData = async () => {
    try {
      const response = await api.get(`/events/${id}`);
      setEvent(response.data.event);
      setSeats(response.data.seats);
      setSeatSummary(response.data.seatSummary);
      setError(null);
      
      try {
        const resResponse = await api.get(`/reserve/active/${id}`);
        if (resResponse.data) {
          setReservation(resResponse.data);
        } else {
          setReservation(prev => {
            // Only clear if the previous reservation is no longer active
            return prev ? null : prev;
          });
        }
      } catch (err) {
        // Ignore auth or fetch errors for reservation status
      }
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load event details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventData();
  }, [id]);

  const handleToggleSeat = (seatNumber) => {
    setActionError(null);
    if (reservation) return; // Can't select new seats if already reserving
    
    setSelectedSeats(prev => {
      const newSet = new Set(prev);
      if (newSet.has(seatNumber)) {
        newSet.delete(seatNumber);
      } else {
        newSet.add(seatNumber);
      }
      return newSet;
    });
  };

  const handleReserve = async () => {
    if (selectedSeats.size === 0) return;
    
    setProcessing(true);
    setActionError(null);
    
    try {
      const response = await api.post('/reserve', {
        eventId: id,
        seatNumbers: Array.from(selectedSeats)
      });
      setReservation(response.data);
      setSelectedSeats(new Set()); // clear selected
      await fetchEventData(); // refresh seat statuses
    } catch (err) {
      setActionError(err.response?.data?.message || 'Some seats were just taken. Please reselect.');
      setSelectedSeats(new Set());
      await fetchEventData();
    } finally {
      setProcessing(false);
    }
  };

  const handleTimerExpire = async () => {
    setReservation(null);
    setActionError('Your reservation has expired. Seats released.');
    await fetchEventData();
  };

  const handleConfirmBooking = async () => {
    if (!reservation) return;
    
    setProcessing(true);
    setActionError(null);
    
    try {
      const response = await api.post('/bookings', {
        reservationId: reservation._id
      });
      setConfirmedSeats(reservation.seatNumbers);
      setShowConfirmModal(true);
      setReservation(null);
      await fetchEventData();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to confirm booking.');
      if (err.response?.status === 410) {
        setReservation(null);
        await fetchEventData();
      }
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-96 text-primary">Loading event data...</div>;
  }

  if (error || !event) {
    return (
      <div className="max-w-3xl mx-auto mt-20 text-center">
        <div className="bg-surface border border-gray-800 p-8 rounded-xl text-error">
          {error || 'Event not found'}
        </div>
        <button onClick={() => navigate('/')} className="mt-6 text-primary hover:underline">← Back to Events</button>
      </div>
    );
  }

  const eventDate = new Date(event.dateTime);

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 pb-24">
      {/* Event Header */}
      <div className="bg-surface border border-gray-800 rounded-2xl p-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        
        <button onClick={() => navigate('/')} className="text-textMuted hover:text-white mb-6 text-sm flex items-center gap-1 transition-colors">
          ← Back to Events
        </button>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            <h1 className="text-4xl font-bold text-white mb-4">{event.name}</h1>
            <div className="flex flex-wrap items-center gap-6 text-textMuted">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-primary" />
                <span>{eventDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at {eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={18} className="text-primary" />
                <span>{event.venue}</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="text-center px-4 py-2 bg-[#0D0D0D] rounded-lg border border-gray-800">
              <div className="text-2xl font-bold text-white">{seatSummary.available}</div>
              <div className="text-xs text-textMuted uppercase tracking-wider">Available</div>
            </div>
            <div className="text-center px-4 py-2 bg-[#0D0D0D] rounded-lg border border-gray-800">
              <div className="text-2xl font-bold text-primary">{event.totalSeats}</div>
              <div className="text-xs text-textMuted uppercase tracking-wider">Total Seats</div>
            </div>
          </div>
        </div>
      </div>

      {actionError && (
        <div className="bg-error/10 border border-error/50 text-error px-6 py-4 rounded-xl mb-8 animate-in fade-in slide-in-from-top-2">
          {actionError}
        </div>
      )}

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Seat Grid */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-4 px-2">
            <h2 className="text-2xl font-bold text-white">Select Your Seats</h2>
            <div className="flex items-center gap-4 text-sm text-textMuted">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-gray-800"></div>Available</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-primary"></div>Selected</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-warning/50"></div>Reserved</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-error/50"></div>Booked</div>
            </div>
          </div>
          
          <SeatGrid 
            seats={seats} 
            selectedSeats={reservation ? new Set(reservation.seatNumbers) : selectedSeats} 
            toggleSeat={handleToggleSeat} 
          />
        </div>

        {/* Right: Action Panel */}
        <div className="lg:col-span-1">
          <div className="bg-surface border border-gray-800 rounded-2xl p-6 sticky top-6">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-800">
              <div className="p-3 bg-primary/20 text-primary rounded-xl">
                <Ticket size={24} />
              </div>
              <h3 className="text-xl font-bold text-white">Booking Summary</h3>
            </div>

            {reservation ? (
              <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                <div className="bg-[#0D0D0D] p-4 rounded-xl border border-gray-800">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-textMuted">Reserved Seats</span>
                    <span className="font-bold text-white">{reservation.seatNumbers.length}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {reservation.seatNumbers.map(s => (
                      <span key={s} className="px-2 py-1 bg-primary/20 text-primary rounded text-sm font-medium">{s}</span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-warning/10 border border-warning/30 rounded-xl">
                  <span className="text-sm font-medium text-warning">Time remaining:</span>
                  <CountdownTimer expiresAt={reservation.expiresAt} onExpire={handleTimerExpire} />
                </div>

                <button 
                  onClick={handleConfirmBooking}
                  disabled={processing}
                  className="w-full py-4 bg-success hover:bg-green-600 text-white rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? 'Processing...' : 'Confirm Booking'}
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {selectedSeats.size > 0 ? (
                  <>
                    <div className="bg-[#0D0D0D] p-4 rounded-xl border border-gray-800">
                      <div className="flex justify-between items-center">
                        <span className="text-textMuted">Selected Seats</span>
                        <span className="font-bold text-white">{selectedSeats.size}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {Array.from(selectedSeats).map(s => (
                          <span key={s} className="px-2 py-1 bg-primary/20 text-primary rounded text-sm font-medium">{s}</span>
                        ))}
                      </div>
                    </div>
                    <button 
                      onClick={handleReserve}
                      disabled={processing}
                      className="w-full py-4 bg-primary hover:bg-violet-700 text-white rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(124,58,237,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processing ? 'Reserving...' : 'Reserve Seats'}
                    </button>
                  </>
                ) : (
                  <div className="text-center py-8 text-textMuted">
                    <p>Select seats from the grid to begin booking.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showConfirmModal && (
        <BookingConfirmModal 
          seatNumbers={confirmedSeats}
          eventName={event.name}
          onClose={() => {
            setShowConfirmModal(false);
            navigate('/');
          }}
        />
      )}
    </div>
  );
};

export default EventDetailPage;
