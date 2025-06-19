export const ROLES = {
  ADMIN: 'Administrator',
  TRAVELER: 'Traveler',
  MANAGER: 'Hotel Manager',
  DATA_OPERATOR: 'Data Operator'
};

export const hasRole = (userRole: string, allowedRoles: string[]): boolean => {
  return allowedRoles.includes(userRole);
};

export const isManager = (userRole: string): boolean => {
  return userRole === ROLES.MANAGER;
};
