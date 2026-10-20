import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import javax.crypto.SecretKey;
import java.util.Date;

public class GenAdminToken {
    public static void main(String[] args) {
        String secret = "your-secret-key-change-in-production-env-variable";
        SecretKey key = Keys.hmacShaKeyFor(secret.getBytes());
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + 25200000);

        String token = Jwts.builder()
                .subject("admin@anywhere.com")
                .claim("userId", 999)
                .claim("email", "admin@anywhere.com")
                .claim("role", "ADMIN")
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();

        System.out.println("ADMIN_TOKEN=" + token);
    }
}
