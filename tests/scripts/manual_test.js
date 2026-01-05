const axios = require('axios');

async function testChat() {
  try {
    console.log('Testing /chatt endpoint...');
    const response = await axios.post('http://localhost:3001/chatt', {
      message: 'Cuanto cuesta la Silla de Comedor Clásica?',
      chat_id: 'manual-test'
    });
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    if (error.response) {
      console.error('Error Response:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error Message:', error.message);
      console.error('Full Error:', error);
    }
  }
}

testChat();
