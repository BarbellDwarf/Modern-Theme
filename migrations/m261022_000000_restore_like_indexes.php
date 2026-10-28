<?php

use humhub\components\Migration;

/**
 * Restores the core like-table index names.
 *
 * An earlier version of the reaction migration replaced core's `unique-object-user`
 * index with `unique-object-user-reaction`. HumHub 1.19's own like migration calls
 * dropIndex('unique-object-user') unconditionally, so leaving the renamed index in
 * place aborts the 1.19 upgrade. Reactions are mutually exclusive per user and
 * target, so the core index (one row per user per target) is sufficient.
 *
 * This migration is idempotent and runs on both the 1.18 and 1.19 table layouts.
 */
class m261022_000000_restore_like_indexes extends Migration
{
    public function up()
    {
        $schema = $this->db->getTableSchema('{{%like}}', true);
        if ($schema === null) {
            return;
        }

        $this->safeDropIndex('unique-object-user-reaction', '{{%like}}');
        $this->safeDropIndex('idx_unique_user_reaction', '{{%like}}');

        if ($schema->getColumn('content_addon_record_id') !== null) {
            // HumHub 1.19 layout
            $this->safeCreateIndex(
                'idx_unique_user',
                '{{%like}}',
                ['content_id', 'content_addon_record_id', 'created_by'],
                true
            );

            return;
        }

        // HumHub 1.18 layout
        $this->safeCreateIndex(
            'unique-object-user',
            '{{%like}}',
            ['object_model', 'object_id', 'created_by'],
            true
        );
    }

    public function down()
    {
        // Index cleanup only; nothing to revert.
    }
}
