import { DataTypes } from 'sequelize';

// RN1: depois de criada, só os campos de arquivamento podem mudar (ver src/database/migrations para o reforço via trigger no banco)
export default (sequelize) => {
  const Ocorrencia = sequelize.define('Ocorrencia', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    alunoId: { type: DataTypes.UUID, allowNull: false },
    turmaId: { type: DataTypes.UUID, allowNull: false }, // turma do aluno NO MOMENTO do registro (RN5)
    tipo: {
      type: DataTypes.ENUM('atraso', 'indisciplina', 'uso_indevido_celular', 'dano_patrimonio', 'destaque_positivo'),
      allowNull: false,
    },
    gravidade: { type: DataTypes.ENUM('leve', 'media', 'grave'), allowNull: false },
    descricao: { type: DataTypes.STRING(500), allowNull: false, validate: { len: [1, 500] } },
    dataOcorrencia: { type: DataTypes.DATEONLY, allowNull: false },
    criadoPor: { type: DataTypes.UUID, allowNull: false },
    arquivada: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    motivoArquivamento: { type: DataTypes.STRING(500) },
    arquivadoPor: { type: DataTypes.UUID },
    arquivadoEm: { type: DataTypes.DATE },
    referenciaId: { type: DataTypes.UUID },
  }, {
    tableName: 'ocorrencias',
    underscored: true,
    createdAt: 'criadoEm',
    updatedAt: false,
  });

  const CAMPOS_ARQUIVAMENTO = ['arquivada', 'motivoArquivamento', 'arquivadoPor', 'arquivadoEm'];

  Ocorrencia.beforeUpdate((ocorrencia) => {
    const alterados = ocorrencia.changed().filter((campo) => !CAMPOS_ARQUIVAMENTO.includes(campo));
    if (alterados.length > 0) throw new Error('OCORRENCIA_IMUTAVEL');
  });

  Ocorrencia.beforeDestroy(() => {
    throw new Error('OCORRENCIA_NAO_PODE_SER_EXCLUIDA');
  });

  return Ocorrencia;
};
