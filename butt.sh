# Update these values and then paste this code block into a bash terminal
nonce='fcc952aa471f9b8b2c97e023f2771b58c2c162fb2e98d8ba46a003cdb2ea0ad612aee69c1634234385bdebd739a3930bd76dce2d94aa79fb9adab7bcbfca0e8e'
username='don'
password='cryptodid'
admin='notadmin'
secret='VTrX-LSoad:L=pw@^z8Ue7VN^NMu6S~-5+v.kpD__REGISTRATION_SHARED_SECRET__iqnPitFV*_'

printf '%s\0%s\0%s\0%s' "$nonce" "$username" "$password" "$admin" |
  openssl sha1 -hmac "$secret" |
  awk '{print $2}'
