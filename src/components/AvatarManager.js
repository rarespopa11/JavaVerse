// src/components/AvatarManager.js - Cu fix pentru problema Forbidden
import React, { useState, useRef } from 'react';
import '../styles/AvatarManager.css';
import { useToast } from './ToastProvider';

/**
 * Componentă pentru gestionarea avatar-ului utilizatorului
 * Permite alegerea unui avatar preset sau upload-ul unei imagini custom
 */
function AvatarManager({ currentAvatar, currentAvatarType, onAvatarChange, onClose }) {
  const [selectedPreset, setSelectedPreset] = useState(currentAvatarType === 'preset' ? currentAvatar : null);
  const [customImage, setCustomImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const toast = useToast();

  // Avatar-uri preset disponibile
  const presetAvatars = [
    { id: 'dev1', name: 'Developer 1', emoji: '👨‍💻' },
    { id: 'dev2', name: 'Developer 2', emoji: '👩‍💻' },
    { id: 'student1', name: 'Student 1', emoji: '🧑‍🎓' },
    { id: 'student2', name: 'Student 2', emoji: '👩‍🎓' },
    { id: 'prof1', name: 'Professor 1', emoji: '👨‍🏫' },
    { id: 'prof2', name: 'Professor 2', emoji: '👩‍🏫' },
    { id: 'ninja', name: 'Code Ninja', emoji: '🥷' },
    { id: 'wizard', name: 'Code Wizard', emoji: '🧙‍♂️' },
    { id: 'robot', name: 'Robot', emoji: '🤖' },
    { id: 'alien', name: 'Alien Coder', emoji: '👽' },
    { id: 'pirate', name: 'Code Pirate', emoji: '🏴‍☠️' },
    { id: 'astronaut', name: 'Space Coder', emoji: '👨‍🚀' }
  ];

  // Verifică și reîmprospătează autentificarea dacă este necesar
  const refreshAuthIfNeeded = async () => {
    const authToken = sessionStorage.getItem('authToken');
    const userId = sessionStorage.getItem('userId');
    
    console.log('=== AUTH CHECK ===');
    console.log('UserId exists:', !!userId);
    console.log('AuthToken exists:', !!authToken);
    
    if (!authToken || !userId) {
      toast.error('Sesiunea a expirat. Te rugăm să te autentifici din nou.');
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
      return false;
    }
    
    // Testează dacă token-ul este valid făcând o cerere simplă
    try {
      const testResponse = await fetch(`http://localhost:5000/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (testResponse.status === 401 || testResponse.status === 403) {
        toast.error('Sesiunea a expirat. Te rugăm să te autentifici din nou.');
        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem('userId');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
        return false;
      }
      
      console.log('Auth token is valid');
      return true;
    } catch (error) {
      console.error('Auth test failed:', error);
      toast.error('Problemă la verificarea autentificării.');
      return false;
    }
  };

  // Gestionează selecția unui avatar preset
  const handlePresetSelect = (presetId) => {
    console.log('Selected preset:', presetId);
    setSelectedPreset(presetId);
    setCustomImage(null);
    setPreviewUrl(null);
  };

  // Gestionează alegerea unei imagini custom
  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    console.log('Selected file:', file.name, file.size, file.type);

    // Validări pentru fișierul ales
    if (!file.type.startsWith('image/')) {
      toast.error('Te rugăm să alegi un fișier imagine valid.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('Imaginea este prea mare. Dimensiunea maximă permisă este 5MB.');
      return;
    }

    setCustomImage(file);
    setSelectedPreset(null);

    // Creăm preview pentru imagine
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target.result);
      console.log('Preview created, size:', e.target.result.length);
    };
    reader.readAsDataURL(file);
  };

  // Salvează avatar-ul ales
  const handleSaveAvatar = async () => {
    console.log('=== SAVE AVATAR DEBUG ===');
    console.log('Selected preset:', selectedPreset);
    console.log('Custom image:', customImage?.name);

    if (!selectedPreset && !customImage) {
      toast.warning('Te rugăm să alegi un avatar.');
      return;
    }

    setIsUploading(true);

    // Verifică autentificarea înainte de a continua
    const isAuthValid = await refreshAuthIfNeeded();
    if (!isAuthValid) {
      setIsUploading(false);
      return;
    }

    try {
      let avatarData = {
        avatarType: selectedPreset ? 'preset' : 'custom',
        avatar: selectedPreset || null
      };

      console.log('Avatar data before processing:', avatarData);

      // Dacă e imagine custom, o convertim în base64
      if (customImage) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          avatarData.avatar = e.target.result;
          console.log('Base64 data length:', e.target.result.length);
          await updateAvatar(avatarData);
        };
        reader.readAsDataURL(customImage);
      } else {
        await updateAvatar(avatarData);
      }
    } catch (error) {
      console.error('Error saving avatar:', error);
      toast.error('Eroare la salvarea avatar-ului. Te rugăm să încerci din nou.');
      setIsUploading(false);
    }
  };

  // Funcție pentru actualizarea avatar-ului pe server
  const updateAvatar = async (avatarData) => {
    try {
      const userId = sessionStorage.getItem('userId');
      const authToken = sessionStorage.getItem('authToken');

      console.log('=== UPDATE AVATAR DEBUG ===');
      console.log('UserId:', userId);
      console.log('AuthToken exists:', !!authToken);
      console.log('AuthToken preview:', authToken ? authToken.substring(0, 20) + '...' : 'none');

      const url = `http://localhost:5000/api/users/${userId}/avatar`;
      console.log('Request URL:', url);

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(avatarData)
      });

      console.log('Response status:', response.status);
      console.log('Response status text:', response.statusText);
      
      // Tratează specific erorile de autentificare
      if (response.status === 401) {
        console.log('Unauthorized - token invalid or expired');
        toast.error('Sesiunea a expirat. Te rugăm să te autentifici din nou.');
        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem('userId');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
        return;
      }
      
      if (response.status === 403) {
        console.log('Forbidden - insufficient permissions');
        toast.error('Nu ai permisiunea să modifici acest avatar. Te rugăm să te autentifici din nou.');
        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem('userId');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
        return;
      }

      const responseText = await response.text();
      console.log('Raw response:', responseText.substring(0, 200) + '...');

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        console.error('Response was:', responseText);
        throw new Error('Server returned invalid JSON response');
      }

      console.log('Parsed response data:', data);

      if (response.ok && data.success) {
        toast.success('Avatar actualizat cu succes!');
        onAvatarChange(avatarData.avatar, avatarData.avatarType);
        onClose();
      } else {
        throw new Error(data.message || `Server error: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('=== UPDATE AVATAR ERROR ===');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        toast.error('Nu se poate conecta la server. Verifică dacă serverul rulează pe portul 5000.');
      } else {
        toast.error(`Eroare la comunicarea cu serverul: ${error.message}`);
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="avatar-manager">
      <div className="avatar-manager-overlay" onClick={onClose}></div>
      <div className="avatar-manager-modal">
        <div className="avatar-manager-header">
          <h3>Alege avatar-ul tău</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="avatar-manager-content">
          {/* Secțiunea pentru avatar-uri preset */}
          <div className="avatar-section">
            <h4>Avatar-uri predefinite</h4>
            <div className="preset-avatars-grid">
              {presetAvatars.map((preset) => (
                <div
                  key={preset.id}
                  className={`preset-avatar ${selectedPreset === preset.id ? 'selected' : ''}`}
                  onClick={() => handlePresetSelect(preset.id)}
                  title={preset.name}
                >
                  <span className="preset-emoji">{preset.emoji}</span>
                  <span className="preset-name">{preset.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Separator */}
          <div className="avatar-divider">
            <span>SAU</span>
          </div>

          {/* Secțiunea pentru imagine custom */}
          <div className="avatar-section">
            <h4>Încarcă imagine proprie</h4>
            <div className="custom-avatar-section">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept="image/*"
                style={{ display: 'none' }}
              />
              
              <div className="custom-avatar-preview">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="custom-preview-img" />
                ) : (
                  <div className="custom-placeholder">
                    <span>📷</span>
                    <p>Fără imagine</p>
                  </div>
                )}
              </div>

              <button
                className="upload-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {previewUrl ? 'Schimbă Imaginea' : 'Alege Imagine'}
              </button>
              
              <p className="upload-hint">
                Format-uri acceptate: JPG, PNG, GIF
              </p>
            </div>
          </div>
        </div>

        {/* Butoanele de acțiune */}
        <div className="avatar-manager-actions">
          <button className="cancel-btn" onClick={onClose} disabled={isUploading}>
            Anulează
          </button>
          <button 
            className="save-btn" 
            onClick={handleSaveAvatar}
            disabled={isUploading || (!selectedPreset && !customImage)}
          >
            {isUploading ? 'Se salvează...' : 'Salvează Avatar'}
          </button>
        </div>

        {/* Debug info - poate fi eliminat după debugging */}
        <div style={{ 
          padding: '10px', 
          backgroundColor: 'rgba(0,0,0,0.5)', 
          fontSize: '12px',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          fontFamily: 'monospace'
        }}>
          <div>Debug Info:</div>
          <div>• Selected Preset: {selectedPreset || 'none'}</div>
          <div>• Custom Image: {customImage?.name || 'none'}</div>
          <div>• UserId: {sessionStorage.getItem('userId') || 'missing'}</div>
          <div>• AuthToken: {sessionStorage.getItem('authToken') ? 'exists' : 'missing'}</div>
        </div>
      </div>
    </div>
  );
}

export default AvatarManager;