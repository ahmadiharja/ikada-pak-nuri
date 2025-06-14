async function testAPI() {
  try {
    console.log('Testing API endpoint...');
    const response = await fetch('http://localhost:3000/api/products/categories?includeCount=true&hierarchical=true');
    console.log('Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Data received:', JSON.stringify(data, null, 2));
      console.log('Number of categories:', data.length);
    } else {
      const errorText = await response.text();
      console.log('Error response:', errorText);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAPI();