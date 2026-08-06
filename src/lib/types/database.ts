export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
	// Allows to automatically instantiate createClient with right options
	// instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
	__InternalSupabase: {
		PostgrestVersion: '14.15';
	};
	public: {
		Tables: {
			admin_users: {
				Row: {
					created_at: string;
					note: string | null;
					user_id: string;
				};
				Insert: {
					created_at?: string;
					note?: string | null;
					user_id: string;
				};
				Update: {
					created_at?: string;
					note?: string | null;
					user_id?: string;
				};
				Relationships: [];
			};
			categories: {
				Row: {
					description: string | null;
					id: string;
					name: string;
					slug: string;
					sort_order: number;
				};
				Insert: {
					description?: string | null;
					id?: string;
					name: string;
					slug: string;
					sort_order?: number;
				};
				Update: {
					description?: string | null;
					id?: string;
					name?: string;
					slug?: string;
					sort_order?: number;
				};
				Relationships: [];
			};
			newsletter_subscribers: {
				Row: {
					consented_at: string;
					created_at: string;
					email: string;
					id: string;
					source_prefix: string | null;
				};
				Insert: {
					consented_at?: string;
					created_at?: string;
					email: string;
					id?: string;
					source_prefix?: string | null;
				};
				Update: {
					consented_at?: string;
					created_at?: string;
					email?: string;
					id?: string;
					source_prefix?: string | null;
				};
				Relationships: [];
			};
			product_images: {
				Row: {
					alt_text: string;
					created_at: string;
					height: number;
					id: string;
					is_primary: boolean;
					product_id: string;
					sort_order: number;
					storage_key: string;
					width: number;
				};
				Insert: {
					alt_text?: string;
					created_at?: string;
					height: number;
					id?: string;
					is_primary?: boolean;
					product_id: string;
					sort_order?: number;
					storage_key: string;
					width: number;
				};
				Update: {
					alt_text?: string;
					created_at?: string;
					height?: number;
					id?: string;
					is_primary?: boolean;
					product_id?: string;
					sort_order?: number;
					storage_key?: string;
					width?: number;
				};
				Relationships: [
					{
						foreignKeyName: 'product_images_product_id_fkey';
						columns: ['product_id'];
						isOneToOne: false;
						referencedRelation: 'products';
						referencedColumns: ['id'];
					}
				];
			};
			product_tags: {
				Row: {
					product_id: string;
					tag: string;
				};
				Insert: {
					product_id: string;
					tag: string;
				};
				Update: {
					product_id?: string;
					tag?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'product_tags_product_id_fkey';
						columns: ['product_id'];
						isOneToOne: false;
						referencedRelation: 'products';
						referencedColumns: ['id'];
					}
				];
			};
			products: {
				Row: {
					category_id: string | null;
					created_at: string;
					currency: string;
					description: string | null;
					id: string;
					is_available: boolean;
					is_published: boolean;
					name: string;
					price_cents: number;
					slug: string;
					sort_order: number;
					summary: string | null;
					updated_at: string;
				};
				Insert: {
					category_id?: string | null;
					created_at?: string;
					currency?: string;
					description?: string | null;
					id?: string;
					is_available?: boolean;
					is_published?: boolean;
					name: string;
					price_cents?: number;
					slug: string;
					sort_order?: number;
					summary?: string | null;
					updated_at?: string;
				};
				Update: {
					category_id?: string | null;
					created_at?: string;
					currency?: string;
					description?: string | null;
					id?: string;
					is_available?: boolean;
					is_published?: boolean;
					name?: string;
					price_cents?: number;
					slug?: string;
					sort_order?: number;
					summary?: string | null;
					updated_at?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'products_category_id_fkey';
						columns: ['category_id'];
						isOneToOne: false;
						referencedRelation: 'categories';
						referencedColumns: ['id'];
					}
				];
			};
			site_settings: {
				Row: {
					commerce_enabled: boolean;
					gated_notice: string | null;
					id: boolean;
					show_prices_when_gated: boolean;
					updated_at: string;
					updated_by: string | null;
				};
				Insert: {
					commerce_enabled?: boolean;
					gated_notice?: string | null;
					id?: boolean;
					show_prices_when_gated?: boolean;
					updated_at?: string;
					updated_by?: string | null;
				};
				Update: {
					commerce_enabled?: boolean;
					gated_notice?: string | null;
					id?: boolean;
					show_prices_when_gated?: boolean;
					updated_at?: string;
					updated_by?: string | null;
				};
				Relationships: [];
			};
			site_settings_audit: {
				Row: {
					changed_at: string;
					changed_by: string | null;
					field: string;
					id: number;
					new_value: string | null;
					old_value: string | null;
				};
				Insert: {
					changed_at?: string;
					changed_by?: string | null;
					field: string;
					id?: number;
					new_value?: string | null;
					old_value?: string | null;
				};
				Update: {
					changed_at?: string;
					changed_by?: string | null;
					field?: string;
					id?: number;
					new_value?: string | null;
					old_value?: string | null;
				};
				Relationships: [];
			};
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			is_admin: { Args: never; Returns: boolean };
			set_primary_product_image: {
				Args: { p_image_id: string };
				Returns: undefined;
			};
		};
		Enums: {
			[_ in never]: never;
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
	DefaultSchemaTableNameOrOptions extends
		| keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends (DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
				DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
		: never) = never
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
			DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
			Row: infer R;
		}
		? R
		: never
	: DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
		? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
				Row: infer R;
			}
			? R
			: never
		: never;

export type TablesInsert<
	DefaultSchemaTableNameOrOptions extends
		keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
	TableName extends (DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
		: never) = never
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
			Insert: infer I;
		}
		? I
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
		? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
				Insert: infer I;
			}
			? I
			: never
		: never;

export type TablesUpdate<
	DefaultSchemaTableNameOrOptions extends
		keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
	TableName extends (DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
		: never) = never
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
			Update: infer U;
		}
		? U
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
		? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
				Update: infer U;
			}
			? U
			: never
		: never;

export type Enums<
	DefaultSchemaEnumNameOrOptions extends
		keyof DefaultSchema['Enums'] | { schema: keyof DatabaseWithoutInternals },
	EnumName extends (DefaultSchemaEnumNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
		: never) = never
> = DefaultSchemaEnumNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
	: DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
		? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
		: never;

export type CompositeTypes<
	PublicCompositeTypeNameOrOptions extends
		keyof DefaultSchema['CompositeTypes'] | { schema: keyof DatabaseWithoutInternals },
	CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
		: never) = never
> = PublicCompositeTypeNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
	: PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
		? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
		: never;

export const Constants = {
	public: {
		Enums: {}
	}
} as const;
