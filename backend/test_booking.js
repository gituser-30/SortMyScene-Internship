const test = async () => {
  try {
    // 1. login or register a user
    const loginRes = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test' + Date.now() + '@example.com',
        password: 'password123'
      })
    });
    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log('Logged in, token:', token);

    // 2. fetch events
    const eventsRes = await fetch('http://localhost:5000/api/events');
    const eventsData = await eventsRes.json();
    const eventId = eventsData[0]._id;
    console.log('Event fetched:', eventId);

    // 3. fetch seats
    const eventRes = await fetch('http://localhost:5000/api/events/' + eventId);
    const eventData = await eventRes.json();
    const availableSeats = eventData.seats.filter(s => s.status === 'available');
    console.log('Available seats:', availableSeats.length);

    // 4. reserve a seat
    if (availableSeats.length === 0) return console.log('No seats available');
    const seatNumber = availableSeats[0].seatNumber;
    
    console.log('Reserving seat:', seatNumber);
    const reserveRes = await fetch('http://localhost:5000/api/reserve', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({
        eventId,
        seatNumbers: [seatNumber]
      })
    });
    
    const reserveData = await reserveRes.json();
    console.log('Reservation status:', reserveRes.status);
    console.log('Reservation response:', reserveData);
    const reservationId = reserveData._id;

    if (!reservationId) return;

    // 5. confirm booking
    console.log('Confirming booking:', reservationId);
    const confirmRes = await fetch('http://localhost:5000/api/bookings', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({ reservationId })
    });

    const confirmData = await confirmRes.json();
    console.log('Confirm status:', confirmRes.status);
    console.log('Confirm response:', confirmData);

  } catch (error) {
    console.error('Error occurred:', error.message);
  }
};

test();
