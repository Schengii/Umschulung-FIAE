import { describe, it, expect } from 'vitest';
import { 
  CICD_YAML_TEMPLATES, 
  POSTGRES_EXPLAIN_PLANS, 
  WEBRTC_SIGNALING_STEPS 
} from './advancedLabsData';

describe('Advanced Labs: CI/CD Matrix, Postgres Explain & WebRTC Signaling', () => {
  it('should validate GitHub Actions CI/CD YAML templates and matrix variants', () => {
    expect(CICD_YAML_TEMPLATES.length).toBeGreaterThanOrEqual(2);
    CICD_YAML_TEMPLATES.forEach(t => {
      expect(t.yaml).toContain('name:');
      expect(t.yaml).toContain('runs-on:');
      expect(t.matrixVariants.length).toBeGreaterThan(0);
    });
  });

  it('should parse PostgreSQL EXPLAIN JSON Plan Tree accurately', () => {
    expect(POSTGRES_EXPLAIN_PLANS.length).toBeGreaterThanOrEqual(1);
    const plan = POSTGRES_EXPLAIN_PLANS[0];
    expect(plan.totalTimeMs).toBeGreaterThan(0);
    expect(plan.planTree.nodeType).toBe('Limit');
    expect(plan.planTree.children.length).toBeGreaterThan(0);

    const sortNode = plan.planTree.children[0];
    expect(sortNode.nodeType).toContain('Sort');
    expect(sortNode.sortMethod).toBeDefined();
  });

  it('should validate 7-step WebRTC P2P SDP and STUN Signaling Handshake', () => {
    expect(WEBRTC_SIGNALING_STEPS.length).toBe(7);
    expect(WEBRTC_SIGNALING_STEPS[0].title).toContain('MediaStream');
    expect(WEBRTC_SIGNALING_STEPS[2].title).toContain('STUN');
    expect(WEBRTC_SIGNALING_STEPS[6].title).toContain('P2P Stream');
  });
});
