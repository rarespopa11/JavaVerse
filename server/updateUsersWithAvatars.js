// server/updateUsersWithAvatars.js
const mongoose = require('mongoose');
require('dotenv').config();

// Conectare la MongoDB
mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/JavaVerseDB')
  .then(() => console.log('Connected to MongoDB...'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

// Schema utilizatorului
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { 
    type: String, 
    default: 'default-avatar.png'
  },
  avatarType: {
    type: String,
    enum: ['default', 'preset', 'custom'],
    default: 'default'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', userSchema);

// Avatar-uri preset pentru asignare aleatoare
const presetAvatars = [
  'dev1', 'dev2', 'student1', 'student2', 'prof1', 'prof2',
  'ninja', 'wizard', 'robot', 'alien', 'pirate', 'astronaut'
];

async function updateUsersWithAvatars() {
  try {
    console.log('Starting to update users with avatars...');
    
    // Găsim toți utilizatorii care nu au avatar sau avatarType setat
    const usersToUpdate = await User.find({
      $or: [
        { avatar: { $exists: false } },
        { avatarType: { $exists: false } },
        { avatar: null },
        { avatarType: null }
      ]
    });
    
    if (usersToUpdate.length === 0) {
      console.log('No users need avatar updates. All users already have avatars set.');
      mongoose.connection.close();
      return;
    }
    
    console.log(`Found ${usersToUpdate.length} users that need avatar updates:`);
    
    // Actualizăm fiecare utilizator
    for (let i = 0; i < usersToUpdate.length; i++) {
      const user = usersToUpdate[i];
      
      // Asignăm un avatar preset aleator pentru diversitate
      const randomPreset = presetAvatars[i % presetAvatars.length];
      
      // Actualizăm utilizatorul
      await User.findByIdAndUpdate(user._id, {
        avatar: randomPreset,
        avatarType: 'preset'
      });
      
      console.log(`✓ Updated user ${user.username || user.email} with avatar: ${randomPreset}`);
    }
    
    console.log(`\n✅ Successfully updated ${usersToUpdate.length} users with avatars!`);
    
    // Verificăm rezultatul
    const allUsers = await User.find({}).select('username email avatar avatarType');
    console.log('\nCurrent user avatars:');
    allUsers.forEach(user => {
      console.log(`- ${user.username || user.email}: ${user.avatar} (${user.avatarType})`);
    });
    
  } catch (error) {
    console.error('Error updating users with avatars:', error);
  } finally {
    mongoose.connection.close();
    console.log('\nDatabase connection closed.');
  }
}

// Rulăm funcția de actualizare
updateUsersWithAvatars();