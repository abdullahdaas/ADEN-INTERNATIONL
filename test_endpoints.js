async function run() {
  const token = "secret-admin-token";
  
  // 1. Fetch properties
  const getRes = await fetch("http://localhost:3000/api/properties");
  const props = await getRes.json();
  const testProp = props.find(p => p.id === 'prop-5');
  
  if (!testProp) {
    console.log("prop-5 not found");
    return;
  }
  
  console.log("=== PUT (New Campaign / Toggle Featured) ===");
  try {
    const putRes = await fetch(`http://localhost:3000/api/properties/${testProp.id}`, {
      method: "PUT",
      headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ isFeatured: true })
    });
    console.log("HTTP Status:", putRes.status);
    const putBody = await putRes.text();
    console.log("Response Body:", putBody);
  } catch (e) {
    console.log("Server Exception:", e.message);
  }

  console.log("\n=== DELETE (Property Delete) ===");
  try {
    const delRes = await fetch(`http://localhost:3000/api/properties/${testProp.id}?hard=true`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    });
    console.log("HTTP Status:", delRes.status);
    const delBody = await delRes.text();
    console.log("Response Body:", delBody);
  } catch (e) {
    console.log("Server Exception:", e.message);
  }
}
run();
