import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navbar, Nav, Button } from "react-bootstrap";

import { LinkContainer } from "react-router-bootstrap";
import { useLocation, useHistory } from "react-router-dom";
import { FcEditImage } from "react-icons/fc";
import { AiOutlineLogin } from "react-icons/ai";
import { RiLogoutCircleLine } from "react-icons/ri";
import { Logout, getAccessToken } from "../actions/userActions";
import decode from "jwt-decode";

const Header = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();
  const [user, setUser] = useState();
  const userState = useSelector(state => state.user)

  const exit = async (id) => {
    await dispatch(Logout(id));
    setUser(null);
    history.push("/");
  };

  const renewAccessToken = async (id) => {
    if(!userState.googleLogin){
      await dispatch(getAccessToken(id));
      setUser(JSON.parse(localStorage.getItem("user")));
    }
    
  };

  useEffect(() => {
    if (localStorage.getItem("user") && !user) {
      setUser(JSON.parse(localStorage.getItem("user")));
    }

    //token belirli sürede kendini yenileyecek
    const interval = setInterval(() => {
      const accessToken = user?.accessToken; //ilgili değer var ise ata yoksa es geç

      if (accessToken) {
        const decodedAccessToken = decode(accessToken);

        //access token süresi doldu ise kullanıcı çıkış yapacak
        if (decodedAccessToken.exp * 1000 < new Date().getTime()) {
          renewAccessToken(user.user._id);
        }
      }
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [location, user]);

  return (
    <header>
      <Navbar bg="primary" variant="dark" expand="lg" collapseOnSelect>
        <LinkContainer to="/">
          <Navbar.Brand href="#home">Anı Kutusu</Navbar.Brand>
        </LinkContainer>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
          <Nav>
            {user ? (
              <>
                <LinkContainer to="/create">
                  <Nav.Link>
                    <Button variant="outline-info">
                      <FcEditImage className="mr-2" size={20} /> Bir anı paylaş
                    </Button>
                  </Nav.Link>
                </LinkContainer>

                <Nav.Link>
                  <Button
                    onClick={(e) => {
                      exit(user.user._id);
                    }}
                    variant="outline-danger"
                  >
                    <RiLogoutCircleLine size={20} className="mr-2" />
                    Çıkış Yap
                  </Button>
                </Nav.Link>
              </>
            ) : (
              <LinkContainer to="/auth">
                <Nav.Link>
                  <Button variant="outline-light">
                    <AiOutlineLogin size={20} className="mr-2" />
                    Giriş
                  </Button>
                </Nav.Link>
              </LinkContainer>
            )}
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    </header>
  );
};

export default Header;
