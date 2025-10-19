import React from 'react';

/**
 * PublicRoute - Wrapper component for public routes
 * No authentication required
 * Can be extended later for analytics, tracking, etc.
 * 
 * @param {Component} component - The component to render
 * @param {Object} props - Additional props to pass to the component
 */
const PublicRoute = ({ component: Component, ...rest }) => {
  return <Component {...rest} />;
};

export default PublicRoute;

