import axios from 'axios'

const testRegistration = async () => {
  try {
    const res = await axios.post('http://localhost:5000/api/drivers/auth/register', {
      name: "Test Driver",
      phone: "+233201234567",
      password: "Driver1234!",
      vehicleType: "Motorcycle",
      vehicleNumber: "GR-1234-22",
      type: "freelance"
    })
    console.log('SUCCESS:', res.data)
  } catch (err) {
    console.error('FAILED:', err.response?.data || err.message)
  }
}

testRegistration()
