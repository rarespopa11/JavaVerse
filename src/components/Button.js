import React from 'react';
import PropTypes from 'prop-types';
import '../styles/Button.css';

/**
 * Un buton reutilizabil cu mai multe variante și efecte de hover
 */
function Button({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'medium', 
  disabled = false,
  fullWidth = false,
  type = 'button',
  icon = null,
  iconPosition = 'left',
  className = '',
  glow = false,
  loading = false,
  ...props 
}) {
  const getButtonClasses = () => {
    const classes = [
      'jv-button',
      `jv-button-${variant}`,
      `jv-button-${size}`,
      fullWidth ? 'jv-button-full-width' : '',
      glow ? 'jv-button-glow' : '',
      loading ? 'jv-button-loading' : '',
      disabled ? 'jv-button-disabled' : '',
      className
    ];
    
    return classes.filter(Boolean).join(' ');
  };

  return (
    <button
      type={type}
      className={getButtonClasses()}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="jv-button-spinner"></span>}
      
      {icon && iconPosition === 'left' && (
        <span className="jv-button-icon jv-button-icon-left">{icon}</span>
      )}
      
      <span className="jv-button-text">{children}</span>
      
      {icon && iconPosition === 'right' && (
        <span className="jv-button-icon jv-button-icon-right">{icon}</span>
      )}
    </button>
  );
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'dark', 'light']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  disabled: PropTypes.bool,
  fullWidth: PropTypes.bool,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  icon: PropTypes.node,
  iconPosition: PropTypes.oneOf(['left', 'right']),
  className: PropTypes.string,
  glow: PropTypes.bool,
  loading: PropTypes.bool
};

export default Button;