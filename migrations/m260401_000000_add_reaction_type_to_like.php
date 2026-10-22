<?php

use humhub\components\Migration;

class m260401_000000_add_reaction_type_to_like extends Migration
{
    public function up()
    {
        // Add reaction_type column with default 'like' (idempotent)
        $this->safeAddColumn('{{%like}}', 'reaction_type', $this->string(50)->notNull()->defaultValue('like'));

        $schema = $this->db->getTableSchema('{{%like}}', true);
        $recordMapMode = $schema !== null && $schema->getColumn('content_addon_record_id') !== null;

        if ($recordMapMode) {
            // HumHub 1.19: likes are keyed by content_id + content_addon_record_id
            $this->safeDropIndex('idx_unique_user', '{{%like}}');
            $this->safeCreateIndex(
                'idx_unique_user_reaction',
                '{{%like}}',
                ['content_id', 'content_addon_record_id', 'created_by', 'reaction_type'],
                true
            );

            return;
        }

        // HumHub 1.18: likes are keyed by object_model + object_id
        $this->safeDropIndex('unique-object-user', '{{%like}}');
        $this->safeCreateIndex(
            'unique-object-user-reaction',
            '{{%like}}',
            ['object_model', 'object_id', 'created_by', 'reaction_type'],
            true
        );
    }

    public function down()
    {
        $schema = $this->db->getTableSchema('{{%like}}', true);
        $recordMapMode = $schema !== null && $schema->getColumn('content_addon_record_id') !== null;

        if ($recordMapMode) {
            $this->safeDropIndex('idx_unique_user_reaction', '{{%like}}');
            $this->safeCreateIndex(
                'idx_unique_user',
                '{{%like}}',
                ['content_id', 'content_addon_record_id', 'created_by'],
                true
            );
        } else {
            $this->safeDropIndex('unique-object-user-reaction', '{{%like}}');
            $this->safeCreateIndex(
                'unique-object-user',
                '{{%like}}',
                ['object_model', 'object_id', 'created_by'],
                true
            );
        }

        // Drop the column (idempotent)
        $this->safeDropColumn('{{%like}}', 'reaction_type');
    }
}
