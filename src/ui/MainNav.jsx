import { NavLink } from "react-router-dom";
import styled from "styled-components";
import { 
  LayoutDashboard, 
  HandHeart, 
  UsersRound, 
  Megaphone, 
  Users, 
  Settings,
  History
} from "lucide-react";

const NavList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

const StyledNavLink = styled(NavLink)`
  &:link,
  &:visited {
    display: flex;
    align-items: center;
    gap: 1.2rem;
    color: var(--color-grey-600);
    font-size: 1.6rem;
    font-weight: 500;
    padding: 1.2rem 2.4rem;
    transition: all 0.3s;
  }

  &:hover,
  &:active,
  &.active:link,
  &.active:visited {
    color: var(--color-brand-600);
    background-color: var(--color-brand-50);
    border-radius: var(--border-radius-sm);
  }

  & svg {
    width: 2.2rem;
    height: 2.2rem;
    color: var(--color-grey-400);
    transition: all 0.3s;
  }

  &:hover svg,
  &:active svg,
  &.active:link svg,
  &.active:visited svg {
    color: var(--color-brand-500);
  }

  /* لمسة إضافية لضبط المحاذاة في الـ RTL */
  & span {
    margin-top: 2px;
  }
`;

export default function MainNav() {
  return (
    <nav>
      <NavList>
       
        <li>
          <StyledNavLink to="/dashboard">
            <LayoutDashboard />
            <span>Dashboard</span>
          </StyledNavLink>
        </li>

       
        <li>
          <StyledNavLink to="/donations">
            <HandHeart />
            <span>Donations</span>
          </StyledNavLink>
        </li>

        {/* إدارة الحالات والمستفيدين */}
        <li>
          <StyledNavLink to="/beneficiaries">
            <UsersRound />
            <span>Beneficiaries</span>
          </StyledNavLink>
        </li>

        {/* إدارة الحملات والنشاطات */}
        <li>
          <StyledNavLink to="/campaigns">
            <Megaphone />
            <span>Campaigns</span>
          </StyledNavLink>
        </li>

        {/* إدارة المستخدمين (صلاحيات الدخول) */}
        <li>
          <StyledNavLink to="/users">
            <Users />
            <span>Management Users</span>
          </StyledNavLink>
        </li>

        {/* سجل النشاطات (Log) - اختياري ولكنه مهم للإدارة */}
        <li>
          <StyledNavLink to="/activity-log">
            <History />
            <span>Activity Log</span>
          </StyledNavLink>
        </li>

        {/* الإعدادات (كفالة اليتيم، اللغة، إلخ) */}
        <li>
          <StyledNavLink to="/settings">
            <Settings />
            <span>Settings</span>
          </StyledNavLink>
        </li>
      </NavList>
    </nav>
  );
}