
import { ADMIN_DASHBOARD, AUDITOR_DASHBOARD, COMPLIANCE_DASHBOARD, FARMER_DASHBOARD, OFFICER_DASHBOARD, TRADER_DASHBOARD } from "../elements/constants";


export interface NavLink {
    label: string;
    path: string;
    icon?: string;
}

export const ROLE_CONFIG: Record<string, NavLink[]> = {
    FARMER: [
        { label: 'Home', path: `${FARMER_DASHBOARD}home` },
        { label: 'My Listings', path: `${FARMER_DASHBOARD}listings` },
        { label: 'Subsidies', path: `${FARMER_DASHBOARD}subsidies` }
    ],
    OFFICER: [
        { label: 'Home', path: `${OFFICER_DASHBOARD}home` },
        { label: 'History', path: `${OFFICER_DASHBOARD}history` }
    ],
    TRADER:[
        { label: 'Home', path: `${TRADER_DASHBOARD}home` },
<<<<<<< HEAD
        { label: 'Crop Listings', path: `${TRADER_DASHBOARD}croplistings` },
        { label: 'Transaction History', path: `${TRADER_DASHBOARD}transaction-history` }
=======
        { label: 'Crop Listings', path: `${TRADER_DASHBOARD}croplistings` }
>>>>>>> 3a69c7932c51cb5bfa775fb20c2419cdcd61bcaa
    ],
    ADMIN: [
        { label: 'Home', path: `${ADMIN_DASHBOARD}home` },
        { label: 'Reports', path: `${ADMIN_DASHBOARD}reports` },
        { label: 'Notifications', path: `${ADMIN_DASHBOARD}notifications` }
    ],
    AUDITOR:[
        {label:'Home',path:`${AUDITOR_DASHBOARD}home`},
        {label:'Audits',path:`${AUDITOR_DASHBOARD}entry`},
    ],
    COMPLIANCE:[
        {label:'Home',path:`${COMPLIANCE_DASHBOARD}home`},
        {label:'Compliances',path:`${COMPLIANCE_DASHBOARD}entry`},
    ],
};