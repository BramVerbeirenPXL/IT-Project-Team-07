const baseUrl = process.env.REACT_APP_EXTERNAL_IP || "https://mutualism-backend-359585659782.europe-west1.run.app/";

const data = {
  // Ophalen van alle bomen
  async getTrees() {
    try {
      const response = await fetch(`${baseUrl}/trees`, {
        method: 'GET',
      });
      if (!response.ok) throw new Error('Failed to fetch trees.');
      return await response.json();
    } catch (error) {
      console.error('Error fetching trees:', error);
      return [];
    }
  },

  // Toevoegen van bomen via bestand
  async addTree(tree, token) {
    try {
      const response = await fetch(`${baseUrl}/trees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: tree.name,
          description: tree.description,
          latitude: tree.latitude,
          longitude: tree.longitude,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error adding tree:", errorData);
        throw new Error("Failed to add tree.");
      }
  
      console.log("Tree added successfully.");
    } catch (error) {
      console.error("Error in addTree:", error);
      throw error;
    }
  },

  async deleteTree(treeId, token) {
    try {

      const response = await fetch(`${baseUrl}/trees/${treeId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok){
        return response;
      }
      else if (!response.ok) {
        const errorData = await response.json();
        console.error("Error removing tree:", errorData);
        throw new Error("Failed to remove tree.");
      }
  
      console.log("Tree removed successfully.");
      return response;
    } catch (error) {
      console.error("Error in deleteTree:", error);
      throw error;
    }
  },

  async updateTree(tree, token) {
    try {
      const response = await fetch(`${baseUrl}/trees/${tree.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          height: tree.height,
          diameter: tree.diameter
        }),
      });
      if (response.ok){
        return response;
      }
      else if (!response.ok) {
        const errorData = await response.json();
        console.error("Error updating tree:", errorData);
        throw new Error("Failed to update tree.");
      }
    } catch (error) {
      console.error("Error in updateTree:", error);
      throw error;
    }
  }
};

export default data;