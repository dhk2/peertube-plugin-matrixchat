import { UnstableValue } from "../NamespacedValue";
/**
 * Represents a response to the CSAPI `/refresh` endpoint.
 */
export interface IRefreshTokenResponse {
    access_token: string;
    expires_in_ms: number;
    refresh_token: string;
}
/**
 * Response to GET login flows as per https://spec.matrix.org/v1.3/client-server-api/#get_matrixclientv3login
 */
export interface ILoginFlowsResponse {
    flows: LoginFlow[];
}
export type LoginFlow = ISSOFlow | IPasswordFlow | ILoginFlow;
export interface ILoginFlow {
    type: string;
}
export interface IPasswordFlow extends ILoginFlow {
    type: "m.login.password";
}
export declare const DELEGATED_OIDC_COMPATIBILITY: UnstableValue<"delegated_oidc_compatibility", "org.matrix.msc3824.delegated_oidc_compatibility">;
/**
 * Representation of SSO flow as per https://spec.matrix.org/v1.3/client-server-api/#client-login-via-sso
 */
export interface ISSOFlow extends ILoginFlow {
    type: "m.login.sso" | "m.login.cas";
    identity_providers?: IIdentityProvider[];
    [DELEGATED_OIDC_COMPATIBILITY.name]?: boolean;
    [DELEGATED_OIDC_COMPATIBILITY.altName]?: boolean;
}
export declare enum IdentityProviderBrand {
    Gitlab = "gitlab",
    Github = "github",
    Apple = "apple",
    Google = "google",
    Facebook = "facebook",
    Twitter = "twitter"
}
export interface IIdentityProvider {
    id: string;
    name: string;
    icon?: string;
    brand?: IdentityProviderBrand | string;
}
/**
 * Parameters to login request as per https://spec.matrix.org/v1.3/client-server-api/#login
 */
export interface ILoginParams {
    identifier?: object;
    password?: string;
    token?: string;
    device_id?: string;
    initial_device_display_name?: string;
}
export declare enum SSOAction {
    /** The user intends to login to an existing account */
    LOGIN = "login",
    /** The user intends to register for a new account */
    REGISTER = "register"
}
/**
 * The result of a successful [MSC3882](https://github.com/matrix-org/matrix-spec-proposals/pull/3882)
 * `m.login.token` issuance request.
 * Note that this is UNSTABLE and subject to breaking changes without notice.
 */
export interface LoginTokenPostResponse {
    /**
     * The token to use with `m.login.token` to authenticate.
     */
    login_token: string;
    /**
     * Expiration in seconds.
     */
    expires_in: number;
}
//# sourceMappingURL=auth.d.ts.map