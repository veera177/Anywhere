package com.app.start_app.rag;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/knowledge")
@CrossOrigin(origins = "*")
public class KnowledgeAdminController {

    private final KnowledgeIngestService ingestService;

    public KnowledgeAdminController(KnowledgeIngestService ingestService) {
        this.ingestService = ingestService;
    }

    @PostMapping("/reindex")
    public ResponseEntity<?> reindex() {
        int count = ingestService.ingestAll();
        return ResponseEntity.ok(Map.of(
                "success", true,
                "indexedDocuments", count,
                "message", "Successfully reindexed " + count + " knowledge documents."
        ));
    }
}
