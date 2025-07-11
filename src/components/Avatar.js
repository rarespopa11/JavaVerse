// src/components/Avatar.js
import React from 'react';
import PropTypes from 'prop-types';
import '../styles/Avatar.css';

/**
 * Componentă reutilizabilă pentru afișarea avatar-urilor utilizatorilor
 * Suportă avatar-uri preset (emoji) și custom (imagini)
 */
function Avatar({ 
  avatar, 
  avatarType = 'default', 
  size = 'medium', 
  username = '', 
  className = '',
  onClick = null,
  showBorder = true,
  showGlow = false 
}) {
  
  // Avatar-urile preset disponibile
  const presetAvatars = {
    'dev1': '👨‍💻', 'dev2': '👩‍💻', 'student1': '🧑‍🎓', 'student2': '👩‍🎓',
    'prof1': '👨‍🏫', 'prof2': '👩‍🏫', 'ninja': '🥷', 'wizard': '🧙‍♂️',
    'robot': '🤖', 'alien': '👽', 'pirate': '🏴‍☠️', 'astronaut': '👨‍🚀'
  };

  // Obține URL-ul avatar-ului în funcție de tip
  const getAvatarContent = () => {
    if (avatarType === 'preset' && avatar && presetAvatars[avatar]) {
      return { type: 'emoji', content: presetAvatars[avatar] };
    } else if (avatarType === 'custom' && avatar && avatar.startsWith('data:image/')) {
      return { type: 'image', content: avatar };
    }
    // Avatar implicit
    return { type: 'emoji', content: '👤' };
  };

  // Obține clasa CSS pentru dimensiune
  const getSizeClass = () => {
    const sizeMap = {
      'small': 'avatar-small',
      'medium': 'avatar-medium', 
      'large': 'avatar-large',
      'xlarge': 'avatar-xlarge'
    };
    return sizeMap[size] || 'avatar-medium';
  };

  // Construiește clasele CSS
  const getAvatarClasses = () => {
    const classes = [
      'jv-avatar',
      getSizeClass(),
      showBorder ? 'avatar-border' : '',
      showGlow ? 'avatar-glow' : '',
      onClick ? 'avatar-clickable' : '',
      className
    ];
    
    return classes.filter(Boolean).join(' ');
  };

  const avatarContent = getAvatarContent();

  // Handler pentru eroarea de încărcare a imaginii
  const handleImageError = (e) => {
    console.warn('Avatar image failed to load, falling back to default');
    // Înlocuim cu avatar-ul implicit
    e.target.style.display = 'none';
    const fallback = e.target.nextSibling;
    if (fallback) {
      fallback.style.display = 'flex';
    }
  };

  return (
    <div 
      className={getAvatarClasses()}
      onClick={onClick}
      title={username ? `${username}'s avatar` : 'User avatar'}
    >
      {avatarContent.type === 'image' ? (
        <>
          <img 
            src={avatarContent.content}
            alt={`${username || 'User'} avatar`}
            className="avatar-image"
            onError={handleImageError}
          />
          {/* Fallback pentru cazul în care imaginea nu se încarcă */}
          <div className="avatar-emoji-fallback" style={{ display: 'none' }}>
            👤
          </div>
        </>
      ) : (
        <div className="avatar-emoji">
          {avatarContent.content}
        </div>
      )}
      
      {/* Overlay pentru starea online (opțional) */}
      {/* Poți adăuga acest feature mai târziu */}
    </div>
  );
}

Avatar.propTypes = {
  avatar: PropTypes.string,
  avatarType: PropTypes.oneOf(['default', 'preset', 'custom']),
  size: PropTypes.oneOf(['small', 'medium', 'large', 'xlarge']),
  username: PropTypes.string,
  className: PropTypes.string,
  onClick: PropTypes.func,
  showBorder: PropTypes.bool,
  showGlow: PropTypes.bool
};

export default Avatar;