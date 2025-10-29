import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export type User = {
  id: number;
  deviceId: string;
  email: string | null;
  code: string | null;
  codeGeneratedAt: string | null;
  isVerified: boolean;
  verifiedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

@Entity({ name: 'user' })
export class UserEntity implements User {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id!: number;

  @Column({ type: 'varchar', length: 255, name: 'device_id' })
  deviceId!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string | null = null;

  @Column({ type: 'varchar', length: 15, nullable: true })
  code: string | null = null;

  @Column({ type: 'datetime', name: 'code_generated_at', default: null })
  codeGeneratedAt: string | null = null;

  @Column({ type: 'boolean', name: 'is_verified' })
  isVerified: boolean = false;

  @Column({ type: 'datetime', name: 'verified_at', default: null })
  verifiedAt: string | null = null;

  @Column({ type: 'datetime', name: 'created_at', default: null })
  createdAt!: string;

  @Column({ type: 'datetime', name: 'updated_at', default: null })
  updatedAt: string | null = null;

  @BeforeInsert()
  setDateCreated(): void {
    this.createdAt = new Date().toISOString();
  }

  @BeforeUpdate()
  setDateUpdated(): void {
    this.updatedAt = new Date().toISOString();
  }
}
