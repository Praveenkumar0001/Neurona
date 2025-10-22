import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../common/Button';

const QuickActions = ({ role = 'patient' }) => {
  const patientActions = [
    { label: 'Book Appointment', icon: '📅', link: '/doctors' },
    { label: 'Symptom Check', icon: '🔍', link: '/symptom-intake' },
    { label: 'View Reports', icon: '📄', link: '/my-reports' },
  ];

  const doctorActions = [
    { label: 'View Schedule', icon: '📅', link: '/schedule' },
    { label: 'Patient List', icon: '👥', link: '/patients' },
    { label: 'Settings', icon: '⚙️', link: '/settings' },
  ];

  const actions = role === 'doctor' ? doctorActions : patientActions;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {actions.map((action, idx) => (
        <Link key={idx} to={action.link}>
          <div className="card-hover text-center p-6">
            <div className="text-5xl mb-3">{action.icon}</div>
            <p className="font-bold">{action.label}</p>
          </div>
        </Link>
      ))}
    </div>
  );
};

export {
  QuickActions
};