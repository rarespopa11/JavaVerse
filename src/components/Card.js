import React from 'react';
import PropTypes from 'prop-types';
import '../styles/Card.css';

/**
 * Componentă reutilizabilă pentru carduri în aplicație
 */
function Card({ 
  children, 
  title, 
  subtitle,
  footer,
  className = '',
  variant = 'default',
  hoverable = true,
  glow = false,
  onClick = null,
  headerIcon = null,
  badge = null
}) {
  const getCardClasses = () => {
    const classes = [
      'jv-card',
      `jv-card-${variant}`,
      hoverable ? 'jv-card-hoverable' : '',
      glow ? 'jv-card-glow' : '',
      onClick ? 'jv-card-clickable' : '',
      className
    ];
    
    return classes.filter(Boolean).join(' ');
  };

  return (
    <div className={getCardClasses()} onClick={onClick}>
      {badge && (
        <div className="jv-card-badge">
          {badge}
        </div>
      )}
      
      {(title || subtitle) && (
        <div className="jv-card-header">
          {headerIcon && <div className="jv-card-header-icon">{headerIcon}</div>}
          <div className="jv-card-header-content">
            {title && <h3 className="jv-card-title">{title}</h3>}
            {subtitle && <div className="jv-card-subtitle">{subtitle}</div>}
          </div>
        </div>
      )}
      
      <div className="jv-card-body">
        {children}
      </div>
      
      {footer && (
        <div className="jv-card-footer">
          {footer}
        </div>
      )}
    </div>
  );
}

Card.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.node,
  subtitle: PropTypes.node,
  footer: PropTypes.node,
  className: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'primary', 'outlined', 'dark']),
  hoverable: PropTypes.bool,
  glow: PropTypes.bool,
  onClick: PropTypes.func,
  headerIcon: PropTypes.node,
  badge: PropTypes.node
};

export default Card;