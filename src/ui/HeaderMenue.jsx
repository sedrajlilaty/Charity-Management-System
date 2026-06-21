
import styled from 'styled-components'
import Logout from '../features/authentication/Logout'
import PermissionButton Icon from './PermissionButton Icon'
import { HiOutlineUser } from 'react-icons/hi'
// import { useNavigate } from 'react-router-dom'
import DarkModetoggle from './DarkModetoggle'
const StyledHedaerMenu= styled.ul`
    
    display: flex;
    gap: 0.4rem;

`
export default function HeaderMenu() {
    // const navigate=useNavigate();
  return (
    <StyledHedaerMenu>
<li>
    <PermissionButton Icon 
    // onClick={()=>navigate('/account')}
    >
        <HiOutlineUser/>
    </PermissionButton Icon>
</li>
<li>
       <DarkModetoggle/>
      </li>
      <li>
        <Logout/>
      </li>
    </StyledHedaerMenu>
  )
}
