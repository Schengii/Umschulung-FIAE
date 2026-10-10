// Zentrale, datengetriebene Lab-Registry: ein Eintrag pro Lab statt
// `lazy`-Import + `case` in App.jsx. Neue Labs werden NUR hier ergänzt
// (plus ein Eintrag in labModulesData.js für Dashboard/Command-Palette).
// In der `activeLabElement`-Switch-Tabelle von App.jsx bleiben nur Tabs, die
// App-Zustand brauchen (Navigation, userState, Fehlerjournal).
// Bei Tab-Kollisionen wirft buildRegistryIndex - jede ID gehört genau einem Lab.
//
// Eintrag:
//   tabs   – alle Tab-IDs/Aliase, die das Lab öffnen
//   load   – dynamischer Import (wird in App.jsx per React.lazy geladen)
//   xp     – optional: { prop, badge, withBadgeArg } – Name der XP-Callback-Prop
//            und Standard-Badge. `withBadgeArg` = Lab ruft onXPGain(xp, badge)
export const LAB_REGISTRY = [
  {
    tabs: ['stp_protocol_lab', 'stp_lab', 'rstp_lab', 'spanning_tree_lab'],
    load: () => import('../components/Content/StpProtocolLab'),
    xp: { prop: 'onRewardXP', badge: 'stp_rstp_master' }
  },
  {
    tabs: ['bpmn_process_lab', 'bpmn_lab', 'bpmn_studio', 'geschaeftsprozess_lab'],
    load: () => import('../components/Content/BpmnProcessLab'),
    xp: { prop: 'onRewardXP', badge: 'bpmn_process_master' }
  },
  {
    tabs: ['backup_strategy_lab', 'backup_lab', 'disaster_recovery_lab', 'gfs_backup_lab'],
    load: () => import('../components/Content/BackupStrategyLab'),
    xp: { prop: 'onRewardXP', badge: 'backup_disaster_recovery_master' }
  },
  {
    tabs: ['wiso_sachmaengel_lab', 'sachmaengel_lab', 'gewaehrleistung_lab', 'ruegepflicht_lab'],
    load: () => import('../components/Content/WisoSachmaengelLab'),
    xp: { prop: 'onRewardXP', badge: 'wiso_sachmaengel_master' }
  },
  {
    tabs: ['struktogramm_lab', 'struktogramm', 'nassi_shneiderman', 'schreibtischtest_lab'],
    load: () => import('../components/Content/StruktogrammLab'),
    xp: { prop: 'onRewardXP', badge: 'struktogramm_master' }
  },
  {
    tabs: ['database_normalization_lab', 'database_normalization', 'normalisierung_lab', 'normalisierung'],
    load: () => import('../components/Content/DatabaseNormalizationLab'),
    xp: { prop: 'onRewardXP', badge: 'database_normalization_master' }
  },
  {
    tabs: ['nat_pat_lab', 'nat_pat', 'nat_lab', 'pat_simulator_lab'],
    load: () => import('../components/Content/NatPatSimulatorLab'),
    xp: { prop: 'onRewardXP', badge: 'nat_pat_master' }
  },
  {
    tabs: ['vlan_trunking_lab', 'vlan_trunking', 'vlan_lab', 'dot1q_lab'],
    load: () => import('../components/Content/VlanTrunkingLab'),
    xp: { prop: 'onRewardXP', badge: 'vlan_trunking_master' }
  },
  {
    tabs: ['usv_calculator_lab', 'usv_calculator', 'usv_lab', 'stromversorgung_lab'],
    load: () => import('../components/Content/UsvCalculatorLab'),
    xp: { prop: 'onRewardXP', badge: 'usv_calculator_master' }
  },
  {
    tabs: ['dhcp_dora_lab', 'dhcp_dora', 'dhcp_lab', 'dora_handshake_lab'],
    load: () => import('../components/Content/DhcpDoraLab'),
    xp: { prop: 'onRewardXP', badge: 'dhcp_dora_master' }
  },
  {
    tabs: ['testverfahren_lab', 'testverfahren', 'aequivalenzklassen_lab', 'grenzwertanalyse_lab'],
    load: () => import('../components/Content/TestverfahrenLab'),
    xp: { prop: 'onRewardXP', badge: 'testverfahren_master' }
  },
  {
    tabs: ['wiso_angebotsvergleich_lab', 'wiso_angebotsvergleich', 'angebotsvergleich_lab', 'skonto_rechner'],
    load: () => import('../components/Content/WisoAngebotsvergleichLab'),
    xp: { prop: 'onRewardXP', badge: 'wiso_angebotsvergleich_master' }
  },
  {
    tabs: ['tcp_state_machine_lab', 'tcp_state_machine', 'tcp_handshake_lab'],
    load: () => import('../components/Content/TcpStateMachineLab'),
    xp: { prop: 'onRewardXP', badge: 'tcp_state_machine_master' }
  },
  {
    tabs: ['transfer_time_lab', 'ihk_transfer_time_lab', 'bandbreite_rechner'],
    load: () => import('../components/Content/IhkTransferTimeLab')
  },
  {
    tabs: ['wiso_payment_lab', 'wiso_zahlungsverkehr', 'payment_lab'],
    load: () => import('../components/Content/WisoPaymentMethodsLab'),
    xp: { prop: 'onXPGain', badge: 'wiso_payment_master', withBadgeArg: true }
  },
  {
    tabs: ['wiso_kalkulation'],
    load: () => import('../components/Content/WisoKalkulationLab')
  },
  {
    tabs: ['ieee754_lab'],
    load: () => import('../components/Content/Ieee754FloatingPointLab')
  },
  {
    tabs: ['ipv6_routing_lab'],
    load: () => import('../components/Content/Ipv6RoutingLab')
  },
  {
    tabs: ['owasp_exploit_lab'],
    load: () => import('../components/Content/OwaspExploitLab')
  },
  {
    tabs: ['neural_net_lab'],
    load: () => import('../components/Content/NeuralNetVisualizerLab')
  },
  {
    tabs: ['cheat_sheets'],
    load: () => import('../components/Content/IhkCheatSheetPdfGenerator')
  },
  {
    tabs: ['p2p_duell'],
    load: () => import('../components/Content/P2pQuizDuellLab')
  },
  {
    tabs: ['sqlite_studio'],
    load: () => import('../components/Content/SqliteWasmStudioLab')
  },
  {
    tabs: ['coding_challenges'],
    load: () => import('../components/Content/LiveCodingChallengeStudio')
  },
  {
    tabs: ['custom_challenges'],
    load: () => import('../components/Content/CustomChallengeCreatorLab')
  },
  {
    tabs: ['git_conflict_lab'],
    load: () => import('../components/Content/GitMergeConflictLab')
  },
  {
    tabs: ['tco_roi_lab'],
    load: () => import('../components/Content/TcoRoiCalculatorLab')
  },
  {
    tabs: ['regex_railroad'],
    load: () => import('../components/Content/RegexRailroadVisualizerLab')
  },
  {
    tabs: ['webhook_inspector'],
    load: () => import('../components/Content/WebhookInspectorLab')
  },
  {
    tabs: ['voice_quiz'],
    load: () => import('../components/Content/VoiceQuizStudioLab')
  },
  {
    tabs: ['scrum_simulator'],
    load: () => import('../components/Content/AgileScrumSimulatorLab')
  },
  {
    tabs: ['graphql_explorer'],
    load: () => import('../components/Content/GraphqlExplorerStudioLab')
  },
  {
    tabs: ['ble_sensor'],
    load: () => import('../components/Content/BleSensorSimulatorLab')
  },
  {
    tabs: ['os_scheduler'],
    load: () => import('../components/Content/OsProcessSchedulerLab')
  },
  {
    tabs: ['packet_sniffer'],
    load: () => import('../components/Content/PacketSnifferLab')
  },
  {
    tabs: ['erd_designer'],
    load: () => import('../components/Content/ErdDesignerLab')
  },
  {
    tabs: ['transformer_attention'],
    load: () => import('../components/Content/TransformerAttentionLab')
  },
  {
    tabs: ['cloud_canvas'],
    load: () => import('../components/Content/CloudArchitectureCanvasLab')
  },
  {
    tabs: ['ihk_grade_calculator'],
    load: () => import('../components/Content/IhkGradeCalculatorLab')
  },
  {
    tabs: ['rack_configurator'],
    load: () => import('../components/Content/RackConfiguratorLab')
  },
  {
    tabs: ['itsm_simulator'],
    load: () => import('../components/Content/ItsmSimulatorLab')
  },
  {
    tabs: ['sm2_spaced_repetition'],
    load: () => import('../components/Content/Sm2SpacedRepetitionLab')
  },
  {
    tabs: ['personal_notebook'],
    load: () => import('../components/Content/PersonalNotebookLab')
  },
  {
    tabs: ['oral_exam'],
    load: () => import('../components/Content/IhkOralExamSimulator'),
    xp: { prop: 'onRewardXP', badge: 'oral_exam_master' }
  },
  {
    tabs: ['sql_joins'],
    load: () => import('../components/Content/SqlJoinVisualizerLab'),
    xp: { prop: 'onRewardXP', badge: 'sql_join_master' }
  },
  {
    tabs: ['git_graph_lab', 'gitvisual'],
    load: () => import('../components/Content/GitBranchGraphLab'),
    xp: { prop: 'onRewardXP', badge: 'git_graph_master' }
  },
  {
    tabs: ['cpu_architecture_lab'],
    load: () => import('../components/Content/CpuArchitectureLab'),
    xp: { prop: 'onRewardXP', badge: 'cpu_master' }
  },
  {
    tabs: ['sql_optimizer_lab'],
    load: () => import('../components/Content/SqlQueryOptimizerLab'),
    xp: { prop: 'onRewardXP', badge: 'sql_optimizer_master' }
  },
  {
    tabs: ['datastructures'],
    load: () => import('../components/Content/DataStructuresLab'),
    xp: { prop: 'onRewardXP', badge: 'trees_graphs_master' }
  },
  {
    tabs: ['cicd_workflow'],
    load: () => import('../components/Content/CiCdWorkflowLab'),
    xp: { prop: 'onRewardXP', badge: 'cicd_workflow_master' }
  },
  {
    tabs: ['anfaenger_guide'],
    load: () => import('../components/Content/AnfaengerGuideHub')
  },
  {
    tabs: ['subnetting'],
    load: () => import('../components/Content/SubnettingLab'),
    xp: { prop: 'onRewardXP', badge: 'subnetting_master' }
  },
  {
    tabs: ['git_lab'],
    load: () => import('../components/Content/GitLab'),
    xp: { prop: 'onRewardXP', badge: 'git_master' }
  },
  {
    tabs: ['algo_lab'],
    load: () => import('../components/Content/AlgoPlaygroundLab'),
    xp: { prop: 'onRewardXP', badge: 'algo_master' }
  },
  {
    tabs: ['python_wasm', 'pythonwasm'],
    load: () => import('../components/Content/PythonWasmLab'),
    xp: { prop: 'onRewardXP', badge: 'python_wasm_master' }
  },
  {
    tabs: ['packet_tracer'],
    load: () => import('../components/Content/PacketTracerLab'),
    xp: { prop: 'onRewardXP', badge: 'packet_tracer_master' }
  },
  {
    tabs: ['leitner'],
    load: () => import('../components/Content/LeitnerFlashcardLab'),
    xp: { prop: 'onRewardXP', badge: 'leitner_master' }
  },
  {
    tabs: ['monaco_studio'],
    load: () => import('../components/Content/MonacoStudioLab'),
    xp: { prop: 'onRewardXP', badge: 'monaco_master' }
  },
  {
    tabs: ['cloud_designer'],
    load: () => import('../components/Content/CloudDesignerLab'),
    xp: { prop: 'onRewardXP', badge: 'cloud_designer_master' }
  },
  {
    tabs: ['api_mock_studio'],
    load: () => import('../components/Content/ApiMockStudioLab'),
    xp: { prop: 'onRewardXP', badge: 'api_mock_master' }
  },
  {
    tabs: ['ctf_lab'],
    load: () => import('../components/Content/CtfChallengeLab'),
    xp: { prop: 'onRewardXP', badge: 'ctf_master' }
  },
  {
    tabs: ['cicd_pipeline'],
    load: () => import('../components/Content/CiCdPipelineLab'),
    xp: { prop: 'onRewardXP', badge: 'cicd_master' }
  },
  {
    tabs: ['docker_compose'],
    load: () => import('../components/Content/DockerComposeLab'),
    xp: { prop: 'onRewardXP', badge: 'docker_compose_master' }
  },
  {
    tabs: ['system_design'],
    load: () => import('../components/Content/SystemDesignLab'),
    xp: { prop: 'onRewardXP', badge: 'system_design_master' }
  },
  {
    tabs: ['regex_master', 'regexmaster'],
    load: () => import('../components/Content/RegexMasterLab'),
    xp: { prop: 'onRewardXP', badge: 'regex_master' }
  },
  {
    tabs: ['websocket_protocol'],
    load: () => import('../components/Content/WebSocketProtocolLab'),
    xp: { prop: 'onRewardXP', badge: 'websocket_protocol_master' }
  },
  {
    tabs: ['vector_search'],
    load: () => import('../components/Content/VectorSearchLab'),
    xp: { prop: 'onRewardXP', badge: 'vector_search_master' }
  },
  {
    tabs: ['bigo_benchmark', 'bigo'],
    load: () => import('../components/Content/BigOBenchmarkLab'),
    xp: { prop: 'onRewardXP', badge: 'bigo_benchmark_master' }
  },
  {
    tabs: ['wasm_rust_studio'],
    load: () => import('../components/Content/WasmRustLab'),
    xp: { prop: 'onRewardXP', badge: 'wasm_rust_master' }
  },
  {
    tabs: ['jwks_rotation_lab'],
    load: () => import('../components/Content/JwksRotationLab')
  },
  {
    tabs: ['postgres_mvcc_lab'],
    load: () => import('../components/Content/PostgresMvccLab')
  },
  {
    tabs: ['http3_quic_lab'],
    load: () => import('../components/Content/Http3QuicLab')
  },
  {
    tabs: ['redis_caching_lab'],
    load: () => import('../components/Content/RedisCachingLab')
  },
  {
    tabs: ['circuit_breaker_lab'],
    load: () => import('../components/Content/CircuitBreakerLab')
  },
  {
    tabs: ['k8s_cni_lab'],
    load: () => import('../components/Content/K8sCniOverlayLab')
  },
  {
    tabs: ['graphql_resolver_lab'],
    load: () => import('../components/Content/GraphqlResolverLab')
  },
  {
    tabs: ['linux_permissions_lab'],
    load: () => import('../components/Content/LinuxPermissionsLab')
  },
  {
    tabs: ['crypto_keygen_lab'],
    load: () => import('../components/Content/CryptoKeygenLab')
  },
  {
    tabs: ['cicd_matrix_lab'],
    load: () => import('../components/Content/CiCdMatrixLinterLab')
  },
  {
    tabs: ['postgres_explain_lab'],
    load: () => import('../components/Content/PostgresExplainVisualizerLab')
  },
  {
    tabs: ['webrtc_signaling_lab'],
    load: () => import('../components/Content/WebRtcSignalingLab')
  },
  {
    tabs: ['code_debugger_lab'],
    load: () => import('../components/Content/CodeExecutionDebuggerLab')
  },
  {
    tabs: ['clean_code_lab'],
    load: () => import('../components/Content/CleanCodeReviewLab')
  },
  {
    tabs: ['dns_http_lab'],
    load: () => import('../components/Content/DnsHttpLifecycleLab')
  },
  {
    tabs: ['sql_transaction_lab'],
    load: () => import('../components/Content/SqlTransactionLab')
  },
  {
    tabs: ['ihk_doc_generator'],
    load: () => import('../components/Content/IhkProjectDocumentationGenerator')
  },
  {
    tabs: ['oauth', 'oauth_oidc'],
    load: () => import('../components/Content/OauthOidcLab')
  },
  {
    tabs: ['websockets'],
    load: () => import('../components/Content/WebSocketsLab')
  },
  {
    tabs: ['perf_lab'],
    load: () => import('../components/Content/PerformanceProfilingLab')
  },
  {
    tabs: ['kubernetes'],
    load: () => import('../components/Content/KubernetesLab')
  },
  {
    tabs: ['rag_ai', 'ragai'],
    load: () => import('../components/Content/RagAiSimulator')
  },
  {
    tabs: ['wasm_compiler'],
    load: () => import('../components/Content/WasmCompilerPlaygroundLab')
  },
  {
    tabs: ['zkp_crypto'],
    load: () => import('../components/Content/ZkpCryptoVisualizerLab')
  },
  {
    tabs: ['oauth_pkce_studio', 'oauth_pkce', 'pkce'],
    load: () => import('../components/Content/OauthPkceStudioLab')
  },
  {
    tabs: ['k8s_cluster_studio', 'k8s_cluster', 'k8s'],
    load: () => import('../components/Content/KubernetesClusterStudioLab')
  },
  {
    tabs: ['webrtc_peer_studio', 'webrtc_peer'],
    load: () => import('../components/Content/WebRtcPeerStudioLab')
  },
  {
    tabs: ['linux_memory_lab'],
    load: () => import('../components/Content/LinuxMemoryLab'),
    xp: { prop: 'onRewardXP', badge: 'linux_memory_master' }
  },
  {
    tabs: ['postgres_pool_lab'],
    load: () => import('../components/Content/PostgresPoolLab'),
    xp: { prop: 'onRewardXP', badge: 'postgres_pool_master' }
  },
  {
    tabs: ['wiso_dunning_lab'],
    load: () => import('../components/Content/WisoDunningLab'),
    xp: { prop: 'onRewardXP', badge: 'wiso_dunning_master' }
  },
  {
    tabs: ['service_mesh_lab'],
    load: () => import('../components/Content/ServiceMeshLab'),
    xp: { prop: 'onRewardXP', badge: 'service_mesh_master' }
  },
  {
    tabs: ['linux_container_lab'],
    load: () => import('../components/Content/LinuxContainerLab'),
    xp: { prop: 'onRewardXP', badge: 'linux_container_master' }
  },
  {
    tabs: ['wiso_contribution_margin'],
    load: () => import('../components/Content/WisoContributionMarginLab'),
    xp: { prop: 'onRewardXP', badge: 'wiso_contribution_margin_master' }
  },
  {
    tabs: ['oauth_token_exchange_lab'],
    load: () => import('../components/Content/OauthTokenExchangeLab'),
    xp: { prop: 'onRewardXP', badge: 'oauth_token_exchange_master' }
  },
  {
    tabs: ['ebpf_xdp_lab'],
    load: () => import('../components/Content/EbpfXdpLab'),
    xp: { prop: 'onRewardXP', badge: 'ebpf_xdp_master' }
  },
  {
    tabs: ['postgres_flamegraph_lab'],
    load: () => import('../components/Content/PostgresFlamegraphLab'),
    xp: { prop: 'onRewardXP', badge: 'postgres_flamegraph_master' }
  },
  {
    tabs: ['wiso_abc_xyz'],
    load: () => import('../components/Content/WisoAbcXyzLab'),
    xp: { prop: 'onRewardXP', badge: 'wiso_abc_xyz_master' }
  },
  {
    tabs: ['wireguard_ztna_lab'],
    load: () => import('../components/Content/WireguardZtnaLab'),
    xp: { prop: 'onRewardXP', badge: 'wireguard_ztna_master' }
  },
  {
    tabs: ['promql_alert_lab'],
    load: () => import('../components/Content/PromqlAlertLab'),
    xp: { prop: 'onRewardXP', badge: 'promql_alert_master' }
  },
  {
    tabs: ['event_sourcing_lab'],
    load: () => import('../components/Content/EventSourcingLab'),
    xp: { prop: 'onRewardXP', badge: 'event_sourcing_master' }
  },
  {
    tabs: ['wiso_loan_collateral'],
    load: () => import('../components/Content/WisoLoanCollateralLab'),
    xp: { prop: 'onRewardXP', badge: 'wiso_loan_collateral_master' }
  },
  {
    tabs: ['webrtc_sfu_lab'],
    load: () => import('../components/Content/WebrtcSfuLab'),
    xp: { prop: 'onRewardXP', badge: 'webrtc_sfu_master' }
  },
  {
    tabs: ['bpftrace_lab'],
    load: () => import('../components/Content/BpftraceLab'),
    xp: { prop: 'onRewardXP', badge: 'bpftrace_master' }
  },
  {
    tabs: ['postgres_wal_lab'],
    load: () => import('../components/Content/PostgresWalLab'),
    xp: { prop: 'onRewardXP', badge: 'postgres_wal_master' }
  },
  {
    tabs: ['wiso_andler'],
    load: () => import('../components/Content/WisoAndlerLab'),
    xp: { prop: 'onRewardXP', badge: 'wiso_andler_master' }
  },
  {
    tabs: ['opentelemetry_tracing_lab'],
    load: () => import('../components/Content/OpentelemetryTracingLab'),
    xp: { prop: 'onRewardXP', badge: 'opentelemetry_tracing_master' }
  },
  {
    tabs: ['linux_bridge_vxlan_lab'],
    load: () => import('../components/Content/LinuxBridgeVxlanLab'),
    xp: { prop: 'onRewardXP', badge: 'linux_bridge_vxlan_master' }
  },
  {
    tabs: ['postgres_partitioning_lab'],
    load: () => import('../components/Content/PostgresPartitioningLab'),
    xp: { prop: 'onRewardXP', badge: 'postgres_partitioning_master' }
  },
  {
    tabs: ['wiso_interest'],
    load: () => import('../components/Content/WisoInterestCalculationsLab'),
    xp: { prop: 'onRewardXP', badge: 'wiso_interest_master' }
  },
  {
    tabs: ['kafka_rebalance_lab'],
    load: () => import('../components/Content/KafkaRebalanceLab'),
    xp: { prop: 'onRewardXP', badge: 'kafka_rebalance_master' }
  },
  {
    tabs: ['bgp_anycast_lab'],
    load: () => import('../components/Content/BgpAnycastLab'),
    xp: { prop: 'onRewardXP', badge: 'bgp_anycast_master' }
  },
  {
    tabs: ['tls_handshake_lab'],
    load: () => import('../components/Content/TlsHandshakeLab'),
    xp: { prop: 'onRewardXP', badge: 'tls_handshake_master' }
  },
  {
    tabs: ['jwt_attack_lab'],
    load: () => import('../components/Content/JwtAttackLab'),
    xp: { prop: 'onRewardXP', badge: 'jwt_attack_defender' }
  },
  {
    tabs: ['cors_pitfalls_lab'],
    load: () => import('../components/Content/CorsPitfallsLab'),
    xp: { prop: 'onRewardXP', badge: 'cors_defender' }
  },
  {
    tabs: ['postgres_fulltext_lab'],
    load: () => import('../components/Content/PostgresFulltextLab'),
    xp: { prop: 'onRewardXP', badge: 'postgres_fulltext_master' }
  },
  {
    tabs: ['wiso_capital_value'],
    load: () => import('../components/Content/WisoCapitalValueLab'),
    xp: { prop: 'onRewardXP', badge: 'wiso_capital_value_master' }
  },
  {
    tabs: ['grpc_protobuf_lab'],
    load: () => import('../components/Content/GrpcProtobufLab'),
    xp: { prop: 'onRewardXP', badge: 'grpc_protobuf_master' }
  },
  {
    tabs: ['nwa_scoring_lab', 'nwa_scoring'],
    load: () => import('../components/Content/NwaScoringLab'),
    xp: { prop: 'onRewardXP', badge: 'nwa_master' }
  },
  {
    tabs: ['raid_calculator_lab', 'raid_calculator'],
    load: () => import('../components/Content/RaidCalculatorLab'),
    xp: { prop: 'onRewardXP', badge: 'raid_master' }
  },
  {
    tabs: ['vlsm_subnet_lab', 'vlsm_subnet'],
    load: () => import('../components/Content/VlsmSubnetLab'),
    xp: { prop: 'onRewardXP', badge: 'vlsm_master' }
  },
  {
    tabs: ['ihk_project_proposal_lab', 'ihk_project_proposal'],
    load: () => import('../components/Content/IhkProjectProposalLab'),
    xp: { prop: 'onRewardXP', badge: 'ihk_proposal_master' }
  },
  {
    tabs: ['cpm_network_lab', 'cpm_network'],
    load: () => import('../components/Content/CpmNetworkLab'),
    xp: { prop: 'onRewardXP', badge: 'cpm_master' }
  },
  {
    tabs: ['uml_diagram_lab', 'uml_diagram'],
    load: () => import('../components/Content/UmlDiagramLab'),
    xp: { prop: 'onRewardXP', badge: 'uml_master' }
  },
  {
    tabs: ['terraform_lab', 'terraform'],
    load: () => import('../components/Content/TerraformLab'),
    xp: { prop: 'onRewardXP', badge: 'terraform_master' }
  },
  {
    tabs: ['oral_defense_studio', 'oral_defense'],
    load: () => import('../components/Content/IhkOralDefenseStudioLab'),
    xp: { prop: 'onRewardXP', badge: 'oral_defense_master' }
  },
  {
    tabs: ['ansible_playbook_lab', 'ansible_playbook'],
    load: () => import('../components/Content/AnsiblePlaybookLab'),
    xp: { prop: 'onRewardXP', badge: 'ansible_master' }
  },
  {
    tabs: ['computation_worker_lab', 'computation_worker'],
    load: () => import('../components/Content/ComputationWorkerLab'),
    xp: { prop: 'onRewardXP', badge: 'worker_master' }
  },
  {
    tabs: ['presentation_timer_lab', 'presentation_timer', 'ihk_presentation_timer'],
    load: () => import('../components/Content/IhkPresentationTimerLab'),
    xp: { prop: 'onRewardXP', badge: 'presentation_master' }
  },
  {
    tabs: ['github_actions_lab', 'github_actions', 'github_actions_workflow_lab'],
    load: () => import('../components/Content/GithubActionsWorkflowLab'),
    xp: { prop: 'onRewardXP', badge: 'github_actions_master' }
  },
  {
    tabs: ['ihk_project_gantt_lab', 'ihk_project_gantt', 'ihk_gantt'],
    load: () => import('../components/Content/IhkProjectGanttLab'),
    xp: { prop: 'onRewardXP', badge: 'ihk_gantt_master' }
  },
  {
    tabs: ['wasm_simd_studio_lab', 'wasm_simd_studio', 'wasm_simd'],
    load: () => import('../components/Content/WasmSimdStudioLab'),
    xp: { prop: 'onRewardXP', badge: 'wasm_simd_master' }
  },
  {
    tabs: ['ihk_wirtschaftlichkeit_lab', 'ihk_wirtschaftlichkeit', 'amortisation_lab'],
    load: () => import('../components/Content/IhkWirtschaftlichkeitLab'),
    xp: { prop: 'onRewardXP', badge: 'ihk_wirtschaftlichkeit_master' }
  },
  {
    tabs: ['webauthn_passkey_lab', 'webauthn_passkey', 'passkey_lab'],
    load: () => import('../components/Content/WebAuthnPasskeyLab'),
    xp: { prop: 'onRewardXP', badge: 'passkey_master' }
  },
  {
    tabs: ['systemd_service_lab', 'systemd_service', 'systemd_lab'],
    load: () => import('../components/Content/SystemdServiceLab'),
    xp: { prop: 'onRewardXP', badge: 'systemd_master' }
  },
  {
    tabs: ['tls_replay_lab', 'tls_replay', '0rtt_replay_lab'],
    load: () => import('../components/Content/TlsReplayLab'),
    xp: { prop: 'onRewardXP', badge: 'tls_replay_master' }
  },
  {
    tabs: ['ihk_risk_analysis_lab', 'ihk_risk_analysis', 'risikoanalyse_lab'],
    load: () => import('../components/Content/IhkRiskAnalysisLab'),
    xp: { prop: 'onRewardXP', badge: 'ihk_risk_master' }
  },
  {
    tabs: ['ebpf_cilium_lab', 'ebpf_cilium', 'cilium_mesh_lab'],
    load: () => import('../components/Content/EbpfCiliumLab'),
    xp: { prop: 'onRewardXP', badge: 'cilium_master' }
  },
  {
    tabs: ['postgres_index_types_lab', 'postgres_index_types', 'postgres_index_lab'],
    load: () => import('../components/Content/PostgresIndexTypesLab'),
    xp: { prop: 'onRewardXP', badge: 'postgres_index_master' }
  },
  {
    tabs: ['dnssec_validation_lab', 'dnssec_validation', 'dnssec_lab'],
    load: () => import('../components/Content/DnssecValidationLab'),
    xp: { prop: 'onRewardXP', badge: 'dnssec_master' }
  },
  {
    tabs: ['ihk_burndown_lab', 'ihk_burndown', 'agile_burndown_lab'],
    load: () => import('../components/Content/IhkAgileBurndownLab'),
    xp: { prop: 'onRewardXP', badge: 'ihk_burndown_master' }
  },
  {
    tabs: ['linux_cow_snapshot_lab', 'linux_cow_snapshot', 'btrfs_cow_lab'],
    load: () => import('../components/Content/LinuxCowSnapshotLab'),
    xp: { prop: 'onRewardXP', badge: 'linux_cow_master' }
  },
  {
    tabs: ['openapi_contract_lab', 'openapi_contract', 'openapi_lab'],
    load: () => import('../components/Content/OpenApiContractLab'),
    xp: { prop: 'onRewardXP', badge: 'openapi_contract_master' }
  },
  {
    tabs: ['data_lineage_etl_lab', 'data_lineage_etl', 'etl_lab'],
    load: () => import('../components/Content/DataLineageEtlLab'),
    xp: { prop: 'onRewardXP', badge: 'etl_data_lineage_master' }
  },
  {
    tabs: ['ihk_tom_catalog_lab', 'ihk_tom_catalog', 'tom_catalog_lab', 'dsgvo_tom'],
    load: () => import('../components/Content/IhkTomCatalogLab'),
    xp: { prop: 'onRewardXP', badge: 'ihk_dsgvo_tom_master' }
  },
  {
    tabs: ['wiso_labor_law_lab', 'wiso_labor_law', 'arbeitsrecht_lab', 'kuendigungsschutz_lab'],
    load: () => import('../components/Content/WisoLaborLawLab'),
    xp: { prop: 'onRewardXP', badge: 'wiso_labor_law_master' }
  },
  {
    tabs: ['ihk_dpia_lab', 'ihk_dpia', 'dpia_lab', 'dsfa_lab'],
    load: () => import('../components/Content/IhkDpiaLab'),
    xp: { prop: 'onRewardXP', badge: 'ihk_dpia_master' }
  },
  {
    tabs: ['bsi_grundschutz_lab', 'bsi_grundschutz', 'nis2_lab'],
    load: () => import('../components/Content/BsiGrundschutzLab'),
    xp: { prop: 'onRewardXP', badge: 'bsi_grundschutz_master' }
  },
  {
    tabs: ['ipv6_ndp_lab', 'ipv6_ndp', 'slaac_lab'],
    load: () => import('../components/Content/Ipv6NdpLab'),
    xp: { prop: 'onRewardXP', badge: 'ipv6_ndp_master' }
  },
  {
    tabs: ['wiso_payroll_lab', 'wiso_payroll', 'gehalt_lab'],
    load: () => import('../components/Content/WisoPayrollLab'),
    xp: { prop: 'onRewardXP', badge: 'wiso_payroll_master' }
  },
  {
    tabs: ['ihk_certificate_pdf_lab', 'ihk_certificate', 'lernpass'],
    load: () => import('../components/Content/IhkCertificatePdfLab'),
    xp: { prop: 'onRewardXP', badge: 'certificate_pdf_master' }
  },
  {
    tabs: ['clean_arch_lab', 'clean_arch', 'hexagonal_arch'],
    load: () => import('../components/Content/CleanArchLab'),
    xp: { prop: 'onRewardXP', badge: 'clean_arch_master' }
  },
  {
    tabs: ['linux_netns_lab', 'linux_netns', 'netns_studio'],
    load: () => import('../components/Content/LinuxNetNsLab'),
    xp: { prop: 'onRewardXP', badge: 'netns_master' }
  },
  {
    tabs: ['wiso_multi_contribution_lab', 'wiso_multi_contribution', 'deckungsbeitrag_mehrstufig'],
    load: () => import('../components/Content/WisoMultiContributionLab'),
    xp: { prop: 'onRewardXP', badge: 'multi_contribution_master' }
  },
  {
    tabs: ['oauth_revocation_lab', 'oauth_revocation', 'token_revocation'],
    load: () => import('../components/Content/OauthRevocationIntrospectionLab'),
    xp: { prop: 'onRewardXP', badge: 'oauth_revocation_master' }
  },
  {
    tabs: ['raid6_galois_lab', 'raid6_galois', 'raid6_dual_parity'],
    load: () => import('../components/Content/Raid6GaloisLab'),
    xp: { prop: 'onRewardXP', badge: 'raid6_galois_master' }
  },
  {
    tabs: ['sqlite_worker_lab', 'sqlite_worker', 'sqlite_worker_studio'],
    load: () => import('../components/Content/SqliteWorkerStudioLab'),
    xp: { prop: 'onRewardXP', badge: 'sqlite_worker_master' }
  },
  {
    tabs: ['wiso_zuschlagskalkulation_lab', 'wiso_zuschlagskalkulation', 'zuschlagskalkulation'],
    load: () => import('../components/Content/WisoZuschlagskalkulationLab'),
    xp: { prop: 'onRewardXP', badge: 'zuschlagskalkulation_master' }
  },
  {
    tabs: ['linux_cap_seccomp_lab', 'linux_cap_seccomp', 'seccomp_lab'],
    load: () => import('../components/Content/LinuxCapSeccompLab'),
    xp: { prop: 'onRewardXP', badge: 'seccomp_master' }
  },
  {
    tabs: ['bgp_path_selection_lab', 'bgp_path_selection', 'bgp_path_lab'],
    load: () => import('../components/Content/BgpPathSelectionLab'),
    xp: { prop: 'onRewardXP', badge: 'bgp_selection_master' }
  },
  {
    tabs: ['wiso_maschinenstundensatz_lab', 'wiso_maschinenstundensatz', 'maschinenstundensatz'],
    load: () => import('../components/Content/WisoMaschinenstundensatzLab'),
    xp: { prop: 'onRewardXP', badge: 'maschinenstundensatz_master' }
  },
  {
    tabs: ['llm_rag_chunking_lab', 'llm_rag_chunking', 'rag_chunking'],
    load: () => import('../components/Content/LlmRagChunkingLab'),
    xp: { prop: 'onRewardXP', badge: 'rag_chunking_master' }
  },
  {
    tabs: ['linux_psi_cgroup_lab', 'linux_psi_cgroup', 'psi_lab'],
    load: () => import('../components/Content/LinuxPsiCgroupLab'),
    xp: { prop: 'onRewardXP', badge: 'linux_psi_master' }
  },
  {
    tabs: ['nwa_sensitivity_lab', 'nwa_sensitivity', 'nwa_monte_carlo'],
    load: () => import('../components/Content/NwaSensitivityLab'),
    xp: { prop: 'onRewardXP', badge: 'nwa_sensitivity_master' }
  },
  {
    tabs: ['webrtc_ice_gathering_lab', 'webrtc_ice_gathering', 'ice_gathering_lab'],
    load: () => import('../components/Content/WebrtcIceGatheringLab'),
    xp: { prop: 'onRewardXP', badge: 'webrtc_ice_master' }
  },
  {
    tabs: ['wiso_rentabilitaet_leverage_lab', 'wiso_rentabilitaet_leverage', 'leverage_effekt'],
    load: () => import('../components/Content/WisoRentabilitaetLeverageLab'),
    xp: { prop: 'onRewardXP', badge: 'wiso_leverage_master' }
  },
  {
    tabs: ['linux_mac_selinux_lab', 'linux_mac_selinux', 'selinux_lab'],
    load: () => import('../components/Content/LinuxMacSelinuxLab'),
    xp: { prop: 'onRewardXP', badge: 'selinux_master' }
  },
  {
    tabs: ['dns_privacy_lab', 'dns_privacy', 'doh_dot_lab'],
    load: () => import('../components/Content/DnsPrivacyLab'),
    xp: { prop: 'onRewardXP', badge: 'dns_privacy_master' }
  },
  {
    tabs: ['wiso_liquiditaet_lab', 'wiso_liquiditaet', 'liquiditaet_lab'],
    load: () => import('../components/Content/WisoLiquiditaetLab'),
    xp: { prop: 'onRewardXP', badge: 'wiso_liquiditaet_master' }
  },
  {
    tabs: ['rag_semantic_cache_lab', 'rag_semantic_cache', 'semantic_cache_lab'],
    load: () => import('../components/Content/RagSemanticCacheLab'),
    xp: { prop: 'onRewardXP', badge: 'semantic_cache_master' }
  },
  {
    tabs: ['jwt_confusion_lab', 'jwt_confusion', 'jwt_security'],
    load: () => import('../components/Content/JwtConfusionLab'),
    xp: { prop: 'onRewardXP', badge: 'jwt_confusion_master' }
  },
  {
    tabs: ['sql_window_functions_lab', 'sql_window_functions', 'window_functions'],
    load: () => import('../components/Content/SqlWindowFunctionsLab'),
    xp: { prop: 'onRewardXP', badge: 'sql_window_functions_master' }
  },
  {
    tabs: ['argocd_gitops_lab', 'argocd_gitops', 'gitops_lab'],
    load: () => import('../components/Content/ArgoCdGitOpsLab'),
    xp: { prop: 'onRewardXP', badge: 'argocd_gitops_master' }
  },
  {
    tabs: ['vector_math_embedding_lab', 'vector_math', 'embedding_distance_lab'],
    load: () => import('../components/Content/VectorMathEmbeddingLab'),
    xp: { prop: 'onRewardXP', badge: 'vector_math_master' }
  },
  {
    tabs: ['sql_isolation_lab', 'sql_isolation', 'acid_isolation_lab'],
    load: () => import('../components/Content/SqlIsolationLab'),
    xp: { prop: 'onAwardXP', withBadgeArg: true }
  },
  {
    tabs: ['dguv_v3_lab', 'dguv_v3', 'itse_elektrotechnik_lab'],
    load: () => import('../components/Content/DguvV3ElektronikLab'),
    xp: { prop: 'onAwardXP', withBadgeArg: true }
  },
  {
    tabs: ['ihk_mep_simulator_lab', 'ihk_mep', 'mep_simulator'],
    load: () => import('../components/Content/IhkMepSimulatorLab'),
    xp: { prop: 'onAwardXP', withBadgeArg: true }
  },
  {
    tabs: ['wiso_financing_lab', 'wiso_financing', 'leasing_vergleich'],
    load: () => import('../components/Content/WisoFinancingLab'),
    xp: { prop: 'onAwardXP', withBadgeArg: true }
  },
  {
    tabs: ['pki_certificate_lab', 'pki_certificate', 'tls_chain_validator'],
    load: () => import('../components/Content/PkiCertificateLab'),
    xp: { prop: 'onAwardXP', withBadgeArg: true }
  },
  {
    tabs: ['routing_dijkstra_lab', 'routing_dijkstra', 'dijkstra_stp_lab'],
    load: () => import('../components/Content/RoutingDijkstraLab'),
    xp: { prop: 'onRewardXP', badge: 'dijkstra_stp_master' }
  },
  {
    tabs: ['http_caching_lab', 'http_caching', 'rfc9111_cache_lab'],
    load: () => import('../components/Content/HttpCachingLab'),
    xp: { prop: 'onRewardXP', badge: 'http_caching_master' }
  },
  {
    tabs: ['exam_readiness_lab', 'exam_readiness', 'ihk_exam_roadmap'],
    load: () => import('../components/Content/ExamReadinessLab'),
    xp: { prop: 'onRewardXP', badge: 'exam_readiness_master' }
  },
  {
    tabs: ['srp_zero_knowledge_lab', 'srp_auth', 'zero_knowledge_lab'],
    load: () => import('../components/Content/SrpZeroKnowledgeLab'),
    xp: { prop: 'onRewardXP', badge: 'srp_zero_knowledge_master' }
  },
  {
    tabs: ['wiso_contract_breach_lab', 'wiso_contract_breach', 'kaufvertragsstoerungen'],
    load: () => import('../components/Content/WisoContractBreachLab'),
    xp: { prop: 'onRewardXP', badge: 'wiso_contract_breach_master' }
  },
  {
    tabs: ['wiso_company_forms_lab', 'wiso_company_forms', 'rechtsformen_lab'],
    load: () => import('../components/Content/WisoCompanyFormsLab'),
    xp: { prop: 'onRewardXP', badge: 'wiso_company_forms_master' }
  },
  {
    tabs: ['mtls_ztna_lab', 'mtls_ztna', 'zero_trust_mesh_lab'],
    load: () => import('../components/Content/MtlsZtnaLab'),
    xp: { prop: 'onRewardXP', badge: 'mtls_ztna_master' }
  },
  {
    tabs: ['wiso_personal_planung_lab', 'wiso_personal_planung', 'personalbedarf_lab'],
    load: () => import('../components/Content/WisoPersonalPlanungLab'),
    xp: { prop: 'onRewardXP', badge: 'wiso_personal_planung_master' }
  },
  {
    tabs: ['oauth21_dpop_lab', 'oauth21_dpop', 'dpop_security_lab'],
    load: () => import('../components/Content/Oauth21DpopLab'),
    xp: { prop: 'onRewardXP', badge: 'oauth21_dpop_master' }
  },
  {
    tabs: ['ihk_proposal_pdf_lab', 'ihk_proposal_pdf', 'projektantrag_pdf'],
    load: () => import('../components/Content/IhkProposalPdfLab'),
    xp: { prop: 'onRewardXP', badge: 'ihk_proposal_pdf_master' }
  },
  {
    tabs: ['bgp_anycast_ddos_lab', 'bgp_anycast_ddos', 'ddos_scrubber_lab'],
    load: () => import('../components/Content/BgpAnycastDdosLab'),
    xp: { prop: 'onRewardXP', badge: 'bgp_anycast_ddos_master' }
  },
  {
    tabs: ['cloud_iam_policy_lab', 'cloud_iam', 'iam_policy_lab'],
    load: () => import('../components/Content/CloudIamPolicyLab'),
    xp: { prop: 'onRewardXP', badge: 'cloud_iam_governance_master' }
  },
  {
    tabs: ['sre_slo_burn_lab', 'sre_slo_burn', 'burn_rate_lab'],
    load: () => import('../components/Content/SreSloBurnLab'),
    xp: { prop: 'onRewardXP', badge: 'sre_slo_burn_master' }
  },
  {
    tabs: ['kafka_consumer_lag_lab', 'kafka_consumer_lag', 'kafka_lag_lab'],
    load: () => import('../components/Content/KafkaConsumerLagLab'),
    xp: { prop: 'onRewardXP', badge: 'kafka_consumer_lag_master' }
  },
  {
    tabs: ['linux_auditd_ebpf_lab', 'linux_auditd', 'auditd_ebpf_lab'],
    load: () => import('../components/Content/LinuxAuditdEbpfLab'),
    xp: { prop: 'onRewardXP', badge: 'linux_auditd_ebpf_master' }
  },
  {
    tabs: ['k8s_gateway_api_lab', 'k8s_gateway_api', 'gateway_api_lab'],
    load: () => import('../components/Content/K8sGatewayApiLab'),
    xp: { prop: 'onRewardXP', badge: 'k8s_gateway_api_master' }
  },
  {
    tabs: ['wiso_break_even_lab', 'wiso_break_even', 'break_even_lab'],
    load: () => import('../components/Content/WisoBreakEvenLab'),
    xp: { prop: 'onRewardXP', badge: 'wiso_break_even_master' }
  },
  {
    tabs: ['dnssec_rollover_lab', 'dnssec_rollover'],
    load: () => import('../components/Content/DnssecRolloverLab'),
    xp: { prop: 'onRewardXP', badge: 'dnssec_rollover_master' }
  },
  {
    tabs: ['wiso_bookkeeping_lab', 'wiso_buchfuehrung', 'bookkeeping_lab'],
    load: () => import('../components/Content/WisoBookkeepingLab'),
    xp: { prop: 'onXPGain', badge: 'wiso_bookkeeping_master', withBadgeArg: true }
  },
  {
    tabs: ['wiso_bab_lab', 'wiso_bab', 'bab_lab'],
    load: () => import('../components/Content/WisoBabLab'),
    xp: { prop: 'onXPGain', badge: 'wiso_bab_master', withBadgeArg: true }
  },
  {
    tabs: ['kafka'],
    load: () => import('../components/Content/KafkaEventLab')
  },
  {
    tabs: ['docker'],
    load: () => import('../components/Content/DockerLab')
  },
  {
    tabs: ['cloud_devops'],
    load: () => import('../components/Content/CloudDevOpsLab')
  },
  {
    tabs: ['security_lab_v2'],
    load: () => import('../components/Content/RedBlueTeamLab')
  },
  {
    tabs: ['api_studio'],
    load: () => import('../components/Content/ApiBenchStudio')
  },
  {
    tabs: ['ai_business'],
    load: () => import('../components/Content/AiBusinessMasterclass')
  },
  {
    tabs: ['podcast'],
    load: () => import('../components/Content/ItPodcastHub')
  },
  {
    tabs: ['lernfelder'],
    load: () => import('../components/Content/FisiLernfelderHub')
  },
  {
    tabs: ['web_components'],
    load: () => import('../components/Content/WebComponentsHub')
  },
  {
    tabs: ['tdd'],
    load: () => import('../components/Content/TddUnitTestLab'),
    xp: { prop: 'onRewardXP', badge: 'tdd_master' }
  },
  {
    tabs: ['architecture'],
    load: () => import('../components/Content/ArchitectureVisualizer')
  },
  {
    tabs: ['design_patterns'],
    load: () => import('../components/Content/DesignPatternsLab')
  },
  {
    tabs: ['big_o'],
    load: () => import('../components/Content/BigOVisualizer')
  },
  {
    tabs: ['quiz_arena'],
    load: () => import('../components/Content/KnowledgeQuizArena'),
    xp: { prop: 'onRewardXP', badge: 'quiz_master' }
  },
  {
    tabs: ['languages'],
    load: () => import('../components/Content/LanguageAcademy')
  },
  {
    tabs: ['ai'],
    load: () => import('../components/Content/AiPromptLab')
  },
  {
    tabs: ['tooling'],
    load: () => import('../components/Content/ToolingSetupGuide')
  },
  {
    tabs: ['app_workshop'],
    load: () => import('../components/Content/AppWorkshop'),
    xp: { prop: 'onCompleteWorkshop', badge: 'app_builder' }
  }
];

/** Map Tab-ID -> Registry-Eintrag (für O(1)-Lookup und Duplikat-Erkennung). */
export function buildRegistryIndex(registry = LAB_REGISTRY) {
  const index = new Map();
  for (const entry of registry) {
    for (const tab of entry.tabs) {
      if (index.has(tab)) throw new Error(`Doppelte Lab-Registry-Tab-ID: ${tab}`);
      index.set(tab, entry);
    }
  }
  return index;
}
