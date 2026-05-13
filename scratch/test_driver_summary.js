import axios from 'axios'

const testSummary = async () => {
  try {
    // 1. Login
    console.log('Logging in...')
    const loginRes = await axios.post('http://localhost:5000/api/drivers/auth/login', {
      phone: "+233201234567",
      password: "Driver1234!"
    })
    
    // Note: The driver is NOT approved yet, so login will fail with 403.
    // I need to approve the driver first in the DB.
    console.log('Login Result:', loginRes.data)
  } catch (err) {
    if (err.response?.status === 403) {
      console.log('EXPECTED FAILURE: Driver pending approval.', err.response.data)
      
      // Let's manually approve the driver using a prisma script
    } else {
      console.error('FAILED:', err.response?.data || err.message)
    }
  }
}

testSummary()
