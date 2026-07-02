import Keycloak from 'keycloak-js'

const keycloakConfig = {
  url: 'https://keycloak-production-5d0e.up.railway.app/',
  realm: 'swmo',
  clientId: 'swmo-frontend'
}

export class AuthService {
  constructor() {
    this.keycloak = new Keycloak(keycloakConfig)
    this.isAuthenticated = false
    this.username = ''
    this.token = ''
  }

  async init() {
    const authenticated = await this.keycloak.init({
      onLoad: 'login-required', //au lieu d'utiliser les guard
      pkceMethod: 'S256',
      checkLoginIframe: false
    })
    this.isAuthenticated = authenticated
    if (authenticated) {
      this.token = this.keycloak.token
      this.username = this.keycloak.tokenParsed?.preferred_username || this.keycloak.tokenParsed?.email || ''
    }
    return this.isAuthenticated
  }

  login() {
    this.keycloak.login()
  }

  logout() {
    this.keycloak.logout({ redirectUri: window.location.origin })
  }

  getToken() {
    return this.token
  }
}
