import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Truck, MapPin, CheckCircle, Navigation, DollarSign } from 'lucide-react';
import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const socket = io(window.location.origin);

const DriverDashboard = () => {
  const [availableOrders, setAvailableOrders] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);
  const [driverInfo, setDriverInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAvailableOrders();
    // fetchDriverInfo(); // Mocked for now
    
    socket.on('connect', () => {
      console.log('Connected to socket');
    });

    return () => socket.disconnect();
  }, []);

  const fetchAvailableOrders = async () => {
    try {
      const res = await axios.get(`${API_URL}/delivery/available-orders`);
      setAvailableOrders(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setLoading(false);
    }
  };

  const handleAcceptOrder = async (orderId) => {
    try {
      const res = await axios.post(`${API_URL}/delivery/accept-order/${orderId}`);
      setActiveOrder(res.data);
      setAvailableOrders(availableOrders.filter(o => o.id !== orderId));
      socket.emit('join_order', orderId);
    } catch (err) {
      alert('Failed to accept order');
    }
  };

  const handleUpdateStatus = async (status) => {
    const endpoint = status === 'PICKED_UP' ? 'pickup-order' : 'complete-order';
    try {
      const res = await axios.post(`${API_URL}/delivery/${endpoint}/${activeOrder.id}`);
      setActiveOrder(status === 'DELIVERED' ? null : res.data);
      if (status === 'DELIVERED') {
        alert('Order completed! Earnings added.');
        fetchAvailableOrders();
      }
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const startLocationTracking = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.watchPosition((position) => {
        const { latitude, longitude } = position.coords;
        socket.emit('update_location', { 
          driverId: driverInfo?.id || 'demo-driver', 
          latitude, 
          longitude 
        });
      });
    }
  };

  if (loading) return <div className="p-8 text-center text-orange-600">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-[#FDFCFB] p-4 md:p-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1C0A00]">Driver Dashboard</h1>
          <p className="text-orange-600">Kokrobite Oasis Delivery</p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-orange-100 px-4 py-2 text-orange-700">
          <DollarSign size={20} />
          <span className="font-bold">GHS 145.50</span>
        </div>
      </header>

      {activeOrder ? (
        <div className="rounded-2xl border border-orange-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-600">
              ACTIVE ORDER #{activeOrder.orderNumber}
            </span>
            <span className="text-sm font-medium text-gray-500">
              {new Date(activeOrder.createdAt).toLocaleTimeString()}
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex gap-3">
              <MapPin className="text-orange-500" />
              <div>
                <p className="font-bold">Customer Address</p>
                <p className="text-gray-600">{activeOrder.deliveryAddress || 'No address provided'}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Navigation className="text-blue-500" />
              <div>
                <p className="font-bold">Delivery Fee</p>
                <p className="text-gray-600">GHS {activeOrder.deliveryFee.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3">
            {activeOrder.deliveryStatus === 'ACCEPTED' ? (
              <button 
                onClick={() => handleUpdateStatus('PICKED_UP')}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-4 font-bold text-white transition-all hover:bg-orange-600"
              >
                <Truck size={20} />
                Confirm Pick Up
              </button>
            ) : (
              <button 
                onClick={() => handleUpdateStatus('DELIVERED')}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-4 font-bold text-white transition-all hover:bg-green-700"
              >
                <CheckCircle size={20} />
                Confirm Delivery & Payment
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <h2 className="text-xl font-bold">Available Orders ({availableOrders.length})</h2>
          
          {availableOrders.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center text-gray-400">
              No orders available right now. Stay tuned!
            </div>
          ) : (
            availableOrders.map(order => (
              <div key={order.id} className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-bold text-lg">Order #{order.orderNumber}</p>
                  <p className="text-orange-600 font-bold">GHS {order.deliveryFee.toFixed(2)}</p>
                </div>
                <p className="text-gray-500 text-sm mb-4">
                  <MapPin size={14} className="inline mr-1" />
                  {order.deliveryAddress || 'Pick-up only'}
                </p>
                <button 
                  onClick={() => handleAcceptOrder(order.id)}
                  className="w-full rounded-xl bg-[#1C0A00] py-3 text-white font-bold transition-all hover:bg-orange-600"
                >
                  Accept Order
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default DriverDashboard;
