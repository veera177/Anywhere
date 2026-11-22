package com.app.start_app.rag;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Knowledge admin endpoints.
 *
 * POST /api/admin/knowledge/reindex  — requires ADMIN JWT (enforced in SecurityConfig)
 * POST /api/rag/reindex              — localhost-only shortcut for local development;
 *                                      rejected with 403 if the caller is not 127.0.0.1
 */
@RestController
@CrossOrigin(origins = {"http://localhost:*", "http://127.0.0.1:*"})
public class KnowledgeAdminController {

    private final KnowledgeIngestService ingestService;

    public KnowledgeAdminController(KnowledgeIngestService ingestService) {
        this.ingestService = ingestService;
    }

    /** Protected endpoint — requires ADMIN role (see SecurityConfig). */
    @PostMapping("/api/admin/knowledge/reindex")
    public ResponseEntity<?> reindex() {
        return runReindex();
    }

    /**
     * Local-dev shortcut — no authentication, but only accepts requests from
     * localhost / 127.0.0.1.  Any external IP gets a 403.
     * Remove or disable this endpoint before deploying to production.
     */
    @PostMapping("/api/rag/reindex")
    public ResponseEntity<?> reindexLocal(HttpServletRequest request) {
        String ip = request.getRemoteAddr();
        if (!"127.0.0.1".equals(ip) && !"0:0:0:0:0:0:0:1".equals(ip) && !"::1".equals(ip)) {
            return ResponseEntity.status(403)
                    .body(Map.of("error", "This endpoint is only accessible from localhost."));
        }
        return runReindex();
    }

    private ResponseEntity<?> runReindex() {
        try {
            int count = ingestService.ingestAll();
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "indexedDocuments", count,
                    "message", "Successfully reindexed " + count + " knowledge documents."
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "error", e.getMessage(),
                    "hint", "Make sure Ollama is running and nomic-embed-text model is pulled."
            ));
        }
    }
}
